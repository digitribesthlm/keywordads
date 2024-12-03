'use client'
import { useEffect, useState } from 'react'

export default function Keywords() {
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    matchType: '',
    campaign: '',
    adGroup: '',
    status: ''
  })

  // Fetch keywords on component mount
  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords')
      if (!res.ok) throw new Error('Failed to fetch keywords')
      const data = await res.json()
      setKeywords(data.keywords)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.sokord.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMatchType = !filters.matchType || keyword.matchType === filters.matchType
    const matchesCampaign = !filters.campaign || keyword.kampanj === filters.campaign
    const matchesAdGroup = !filters.adGroup || keyword.annonsgrupp === filters.adGroup
    const matchesStatus = !filters.status || keyword.status === filters.status

    return matchesSearch && matchesMatchType && matchesCampaign && matchesAdGroup && matchesStatus
  })

  // Get unique values for filters
  const uniqueValues = {
    matchTypes: [...new Set(keywords.map(k => k.matchType))],
    campaigns: [...new Set(keywords.map(k => k.kampanj))],
    adGroups: [...new Set(keywords.map(k => k.annonsgrupp))],
    statuses: [...new Set(keywords.map(k => k.status))]
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Keyword', 'Match Type', 'Campaign', 'Ad Group', 'Status']
    const csvData = filteredKeywords.map(k => 
      [k.sokord, k.matchType, k.kampanj, k.annonsgrupp, k.status].join(',')
    )
    
    const csv = [headers.join(','), ...csvData].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keywords.csv'
    a.click()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Keywords Management</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Keywords
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Search keywords..."
            />
          </div>
          
          {/* Filter Dropdowns */}
          {Object.entries({
            matchType: uniqueValues.matchTypes,
            campaign: uniqueValues.campaigns,
            adGroup: uniqueValues.adGroups,
            status: uniqueValues.statuses
          }).map(([key, values]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <select
                value={filters[key]}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                {values.map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKeywords.map((keyword) => (
              <tr key={keyword._id}>
                <td className="px-6 py-4 whitespace-nowrap">{keyword.sokord}</td>
                <td className="px-6 py-4 whitespace-nowrap">{keyword.matchType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{keyword.kampanj}</td>
                <td className="px-6 py-4 whitespace-nowrap">{keyword.annonsgrupp}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-sm ${
                    keyword.status === 'Aktiverad' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
  )
} 