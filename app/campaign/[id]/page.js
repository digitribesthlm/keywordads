'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function CampaignGroup() {
  const params = useParams()
  const [campaignData, setCampaignData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedCampaign, setExpandedCampaign] = useState(null)

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const [campaignsRes, keywordsRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/keywords')
        ])

        if (!campaignsRes.ok || !keywordsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const campaignsData = await campaignsRes.json()
        const keywordsData = await keywordsRes.json()

        // Find the main campaign by ID
        const mainCampaign = campaignsData.campaigns.find(c => c._id === params.id)
        if (!mainCampaign) throw new Error('Campaign not found')

        // Get all campaigns in the same group
        const baseName = mainCampaign.name.split('-')[0].trim()
        const groupCampaigns = campaignsData.campaigns.filter(
          campaign => campaign.name.split('-')[0].trim() === baseName
        )

        // Organize data by campaign and ad groups
        const organizedData = groupCampaigns.reduce((acc, campaign) => {
          if (!acc[campaign.name]) {
            acc[campaign.name] = {
              campaignInfo: campaign,
              adGroups: {}
            }
          }
          return acc
        }, {})

        // Add keywords to their respective campaigns and ad groups
        keywordsData.keywords.forEach(keyword => {
          if (organizedData[keyword.kampanj]) {
            if (!organizedData[keyword.kampanj].adGroups[keyword.annonsgrupp]) {
              organizedData[keyword.kampanj].adGroups[keyword.annonsgrupp] = []
            }
            organizedData[keyword.kampanj].adGroups[keyword.annonsgrupp].push(keyword)
          }
        })

        setCampaignData({
          groupName: baseName,
          campaigns: organizedData
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignData()
  }, [params.id])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!campaignData) {
    return <div className="p-6">Campaign group not found</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{campaignData.groupName}</h1>

      <div className="space-y-6">
        {Object.entries(campaignData.campaigns).map(([campaignName, campaign]) => (
          <div key={campaignName} className="bg-white rounded-lg shadow">
            <button
              onClick={() => setExpandedCampaign(expandedCampaign === campaignName ? null : campaignName)}
              className="w-full p-4 border-b bg-gray-50 flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">{campaignName}</h2>
                <span className={`px-2 py-1 rounded text-sm ${
                  campaign.campaignInfo.status === 'Aktiverad' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.campaignInfo.status}
                </span>
              </div>
              <span className="text-gray-500">
                {expandedCampaign === campaignName ? '▼' : '▶'}
              </span>
            </button>

            {expandedCampaign === campaignName && (
              <div className="p-4 space-y-6">
                {Object.entries(campaign.adGroups).map(([adGroupName, keywords]) => (
                  <div key={adGroupName} className="border rounded-lg">
                    <div className="bg-gray-50 p-3 border-b">
                      <h3 className="font-medium">{adGroupName}</h3>
                      <p className="text-sm text-gray-500">
                        {keywords.length} keywords ({keywords.filter(k => k.status === 'Aktiverad').length} active)
                      </p>
                    </div>
                    <div className="p-3">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {keywords.map(keyword => (
                            <tr key={keyword._id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm">{keyword.sokord}</td>
                              <td className="px-3 py-2 text-sm">{keyword.matchType}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  keyword.status === 'Aktiverad' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {keyword.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 