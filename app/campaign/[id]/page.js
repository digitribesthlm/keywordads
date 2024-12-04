'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

export default function CampaignGroup() {
  const params = useParams()
  const [campaignData, setCampaignData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAdGroup, setSelectedAdGroup] = useState(null)
  const tableRef = useRef(null)

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

        // Find the main campaign by ID and get group campaigns
        const mainCampaign = campaignsData.campaigns.find(c => c._id === params.id)
        if (!mainCampaign) throw new Error('Campaign not found')
        const baseName = mainCampaign.name.split('-')[0].trim()
        const groupCampaigns = campaignsData.campaigns.filter(
          campaign => campaign.name.split('-')[0].trim() === baseName
        )

        // Organize data by ad groups with statistics
        const adGroupStats = {}
        keywordsData.keywords.forEach(keyword => {
          const campaign = groupCampaigns.find(c => c.name === keyword.kampanj)
          if (campaign) {
            if (!adGroupStats[keyword.annonsgrupp]) {
              adGroupStats[keyword.annonsgrupp] = {
                name: keyword.annonsgrupp,
                campaign: keyword.kampanj,
                totalKeywords: 0,
                activeKeywords: 0,
                pausedKeywords: 0,
                keywords: []
              }
            }
            adGroupStats[keyword.annonsgrupp].totalKeywords++
            adGroupStats[keyword.annonsgrupp].keywords.push(keyword)
            if (keyword.status === 'Aktiverad') {
              adGroupStats[keyword.annonsgrupp].activeKeywords++
            } else {
              adGroupStats[keyword.annonsgrupp].pausedKeywords++
            }
          }
        })

        setCampaignData({
          groupName: baseName,
          adGroups: adGroupStats
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignData()
  }, [params.id])

  const handleAdGroupClick = (adGroupName) => {
    setSelectedAdGroup(selectedAdGroup === adGroupName ? null : adGroupName)
    
    // Scroll to table after a short delay to allow animation
    if (selectedAdGroup !== adGroupName) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!campaignData) {
    return <div className="p-6">Campaign group not found</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{campaignData.groupName}</h1>

      {/* Ad Group Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.values(campaignData.adGroups).map((adGroup) => (
          <button
            key={adGroup.name}
            onClick={() => handleAdGroupClick(adGroup.name)}
            className={`text-left p-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105 ${
              selectedAdGroup === adGroup.name 
                ? 'bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold text-lg mb-2">{adGroup.name}</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Campaign: <span className="font-medium">{adGroup.campaign}</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold">{adGroup.totalKeywords}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="font-semibold text-green-600">{adGroup.activeKeywords}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paused</p>
                  <p className="font-semibold text-yellow-600">{adGroup.pausedKeywords}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(adGroup.activeKeywords / adGroup.totalKeywords) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                {Math.round((adGroup.activeKeywords / adGroup.totalKeywords) * 100)}% active
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Keywords Table with Slide Animation */}
      <div
        ref={tableRef}
        className={`transition-all duration-500 overflow-hidden ${
          selectedAdGroup 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        {selectedAdGroup && (
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedAdGroup} Keywords</h2>
              <button
                onClick={scrollToTop}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Back to top
              </button>
            </div>
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campaignData.adGroups[selectedAdGroup].keywords.map(keyword => (
                    <tr key={keyword._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{keyword.sokord}</td>
                      <td className="px-4 py-3">{keyword.matchType}</td>
                      <td className="px-4 py-3">
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
              {/* Bottom Back to Top Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={scrollToTop}
                  className="text-blue-600 hover:text-blue-700 flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Back to top
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 