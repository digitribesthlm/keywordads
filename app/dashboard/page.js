'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalKeywords: 0,
    activeKeywords: 0,
    pausedKeywords: 0,
    totalCampaigns: 0
  })
  const [campaigns, setCampaigns] = useState([])
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

        const activeKeywords = keywordsData.keywords.filter(k => k.status === 'Aktiverad').length
        const pausedKeywords = keywordsData.keywords.filter(k => k.status === 'Pausad').length

        setStats({
          totalKeywords: keywordsData.keywords.length,
          activeKeywords,
          pausedKeywords,
          totalCampaigns: campaignsData.campaigns.length
        })

        setCampaigns(campaignsData.campaigns)
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
          <h2 className="text-xl font-semibold">Campaigns Overview</h2>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Campaign Name</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Ad Group</th>
                <th className="px-4 py-2 text-left">Views</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="border-t">
                  <td className="px-4 py-2">{campaign.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      campaign.status === 'Aktiverad' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{campaign.adGroup}</td>
                  <td className="px-4 py-2">{campaign.visningar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 