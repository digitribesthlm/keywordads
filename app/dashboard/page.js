'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalKeywords: 0,
    activeKeywords: 0,
    pausedKeywords: 0,
    totalCampaigns: 0
  })
  const [campaignGroups, setCampaignGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Group campaigns by base name with ID
        const grouped = campaignsData.campaigns.reduce((acc, campaign) => {
          const baseName = campaign.name.split('-')[0].trim()
          if (!acc[baseName]) {
            acc[baseName] = {
              groupId: campaign._id, // Store first campaign ID as group ID
              campaigns: [],
              totalKeywords: 0,
              activeKeywords: 0,
              pausedKeywords: 0
            }
          }
          acc[baseName].campaigns.push(campaign)
          return acc
        }, {})

        // Add keyword stats to each group
        keywordsData.keywords.forEach(keyword => {
          const campaignBaseName = keyword.kampanj.split('-')[0].trim()
          if (grouped[campaignBaseName]) {
            grouped[campaignBaseName].totalKeywords++
            if (keyword.status === 'Aktiverad') {
              grouped[campaignBaseName].activeKeywords++
            } else if (keyword.status === 'Pausad') {
              grouped[campaignBaseName].pausedKeywords++
            }
          }
        })

        setCampaignGroups(grouped)
        setStats({
          totalKeywords: keywordsData.keywords.length,
          activeKeywords: keywordsData.keywords.filter(k => k.status === 'Aktiverad').length,
          pausedKeywords: keywordsData.keywords.filter(k => k.status === 'Pausad').length,
          totalCampaigns: campaignsData.campaigns.length
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Keywords</h3>
          <p className="text-2xl font-bold">{stats.totalKeywords}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Active Keywords</h3>
          <p className="text-2xl font-bold text-green-600">{stats.activeKeywords}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Paused Keywords</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pausedKeywords}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Campaigns</h3>
          <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Campaign Groups</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(campaignGroups).map(([groupName, data]) => (
            <Link 
              key={data.groupId}
              href={`/campaign/${data.groupId}`}
              className="block hover:bg-gray-50"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{groupName}</h3>
                  <span className="text-sm text-gray-500">
                    {data.campaigns.length} campaigns
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-green-600">{data.activeKeywords}</span> active keywords
                  </div>
                  <div>
                    <span className="font-medium text-yellow-600">{data.pausedKeywords}</span> paused keywords
                  </div>
                  <div>
                    <span className="font-medium">{data.totalKeywords}</span> total keywords
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 