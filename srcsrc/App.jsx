
import React, { useEffect, useState, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/*
  Cappereal Admin — cappereal.com
  Single-file React app. Tailwind CSS assumed. Uses recharts for charts.
  Local-only version (Option 1). Admin mode unlocked with a password (local to browser).
*/

// Change this default admin password here if you wish (only stored in code/browser).
// For stronger security you'd use a backend; this is local-only convenience.
const DEFAULT_ADMIN_PASSWORD = 'admin123' 

export default function App() {
  const STORAGE_KEY = 'cappereal_data_v1'
  const ADMIN_KEY = 'cappereal_admin_unlocked_v1'

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) { /* ignore */ }
    // start empty — no demo data
    return { cappers: [], bets: [] }
  })

  const [isAdmin, setIsAdmin] = useState(()=> {
    try {
      return localStorage.getItem(ADMIN_KEY) === 'true'
    } catch(e) { return false }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY, isAdmin ? 'true' : 'false')
  }, [isAdmin])

  const [selectedCapper, setSelectedCapper] = useState(null)
  const [filterRange, setFilterRange] = useState('all') // all|7|30|yesterday
  const [view, setView] = useState('dashboard')

  // CRUD for Cappers (admin-only actions)
  function addCapper(name) {
    const trimmed = String(name||'').trim()
    if (!trimmed) return
    const id = 'c' + Date.now()
    setData(d => ({ ...d, cappers: [...d.cappers, { id, name: trimmed }] }))
  }
  function editCapper(id, name) {
    const trimmed = String(name||'').trim()
    if (!trimmed) return
    setData(d => ({ ...d, cappers: d.cappers.map(c=> c.id===id ? {...c, name: trimmed} : c) }))
  }
  function removeCapper(id) {
    setData(d => ({ cappers: d.cappers.filter(c => c.id !== id), bets: d.bets.filter(b => b.capperId !== id) }))
    if (selectedCapper === id) setSelectedCapper(null)
  }

  // Add Bet (admin-only)
  function addBet({ capperId, date, sport, matchup, odds, stake, result }) {
    const profit = computeProfit(odds, stake, result)
    const id = 'b' + Date.now()
    setData(d => ({ ...d, bets: [...d.bets, { id, capperId, date, sport, matchup, odds: Number(odds), stake: Number(stake), result, profit }] }))
  }

  function editBet(id, updates) {
    setData(d => ({ ...d, bets: d.bets.map(b=> b.id===id ? {...b, ...updates, profit: computeProfit(updates.odds ?? b.odds, updates.stake ?? b.stake, updates.result ?? b.result)} : b) }))
  }

  function removeBet(id) {
    setData(d => ({ ...d, bets: d.bets.filter(b => b.id !== id) }))
  }

  function computeProfit(odds, stake, result) {
    const toMoney = (x)=> Math.round(Number(x)*100)/100
    odds = Number(odds)
    stake = Number(stake)
    if (!Number.isFinite(odds) || !Number.isFinite(stake)) return 0
    if (result === 'push') return 0
    if (result === 'loss') return -toMoney(stake)
    // win — American odds
    if (odds > 0) return toMoney(stake * (odds / 100))
    return toMoney(stake * (100 / Math.abs(odds)))
  }

  // Filters
  function filterBets(bets, capperId = null, range = filterRange) {
    let filtered = bets.slice()
    if (capperId) filtered = filtered.filter(b => b.capperId === capperId)
    const now = new Date()
    if (range === '7') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(b => new Date(b.date) >= cutoff)
    } else if (range === '30') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(b => new Date(b.date) >= cutoff)
    } else if (range === 'yesterday') {
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      const yend = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter(b => { const d = new Date(b.date); return d >= y && d < yend })
    }
    return filtered.sort((a,b)=>new Date(b.date)-new Date(a.date))
  }

  // Stats per capper
  function summarize(bets){
    const profit = bets.reduce((s,b)=>s+Number(b.profit||0),0)
    const stake = bets.reduce((s,b)=>s+Number(b.stake||0),0)
    const wins = bets.filter(b=>b.result==='win').length
    const losses = bets.filter(b=>b.result==='loss').length
    const pushes = bets.filter(b=>b.result==='push').length
    return { bets: bets.length, profit: Math.round(profit*100)/100, stake: Math.round(stake*100)/100, wins, losses, pushes }
  }

  function statsFor(capperId) {
    const bets = data.bets.filter(b => b.capperId === capperId)
    const allTime = summarize(bets)
    const last7 = summarize(filterBets(bets, capperId, '7'))
    const last30 = summarize(filterBets(bets, capperId, '30'))
    const yesterday = summarize(filterBets(bets, capperId, 'yesterday'))
    return { allTime, last7, last30, yesterday }
  }

  // Leaderboard sort by total profit then ROI
  const leaderboard = useMemo(() => {
    return data.cappers.map(c => {
      const s = statsFor(c.id).allTime
      return { ...c, totalProfit: s.profit, bets: s.bets, roi: s.stake ? (s.profit / s.stake) : 0 }
    }).sort((a,b)=> b.totalProfit - a.totalProfit || b.roi - a.roi)
  }, [data])

  // Admin unlock
  function unlockAdmin(password) {
    if (String(password) === DEFAULT_ADMIN_PASSWORD) {
      setIsAdmin(true)
      return true
    }
    return false
  }
  function lockAdmin() {
    setIsAdmin(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Cappereal Admin <span className="text-indigo-600">cappereal.com</span></h1>
        <div className="flex flex-wrap gap-2 items-center">
          <NavButton active={view==='dashboard'} onClick={()=>setView('dashboard')}>Dashboard</NavButton>
          <NavButton active={view==='cappers'} onClick={()=>setView('cappers')}>Cappers</NavButton>
          <NavButton active={view==='bets'} onClick={()=>setView('bets')}>Bets</NavButton>
          <NavButton active={view==='leaderboard'} onClick={()=>setView('leaderboard')}>Leaderboard</NavButton>
          <ExportJSON data={data} setData={setData} STORAGE_KEY={STORAGE_KEY} />
          <div className="ml-2">
            {isAdmin ? (
              <button onClick={lockAdmin} className="px-3 py-1 bg-red-50 border text-sm rounded">Admin: ON (click to lock)</button>
            ) : (
              <AdminUnlock onUnlock={unlockAdmin} />
            )}
          </div>
        </div>
      </header>

      <main>
        {view === 'dashboard' && (
          <Dashboard data={data} leaderboard={leaderboard} setSelectedCapper={setSelectedCapper} selectedCapper={selectedCapper} filterRange={filterRange} setFilterRange={setFilterRange} statsFor={statsFor} filterBets={filterBets} />
        )}
        {view === 'cappers' && (
          <CappersPanel cappers={data.cappers} addCapper={addCapper} editCapper={editCapper} removeCapper={removeCapper} select={(id)=>{setSelectedCapper(id); setView('bets')}} isAdmin={isAdmin} />
        )}
        {view === 'bets' && (
          <BetsPanel data={data} addBet={addBet} editBet={editBet} removeBet={removeBet} computeProfit={computeProfit} setData={setData} selectedCapper={selectedCapper} setSelectedCapper={setSelectedCapper} filterBets={filterBets} statsFor={statsFor} isAdmin={isAdmin} />
        )}
        {view === 'leaderboard' && (
          <Leaderboard leaderboard={leaderboard} />
        )}
      </main>

      <footer className="mt-8 text-sm text-gray-600">Admin panel — Manual odds entry, full filters, import/export JSON. Data stored locally in your browser. Admin unlock is local to this browser only.</footer>
    </div>
  )
}

/* -- UI components -- */

function NavButton({active, children, onClick}){
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-2xl shadow-sm transition ${active? 'bg-indigo-600 text-white':'bg-white border hover:bg-gray-50'}`}>{children}</button>
  )
}

function AdminUnlock({onUnlock}){
  const [pw, setPw] = useState('')
  function tryUnlock(e){
    e.preventDefault()
    if(onUnlock(pw)) { setPw(''); alert('Admin unlocked for this browser. You can now add/edit/remove cappers and bets.') }
    else alert('Wrong password')
  }
  return (
    <form onSubmit={tryUnlock} className="flex items-center gap-2">
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Admin password" className="border p-1 rounded text-sm" />
      <button className="px-2 py-1 border rounded text-sm">Unlock</button>
    </form>
  )
}

function Dashboard({ data, leaderboard, setSelectedCapper, selectedCapper, filterRange, setFilterRange, statsFor, filterBets }){
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Cappers" value={data.cappers.length} />
            <StatCard label="Total Bets" value={data.bets.length} />
            <StatCard label="Total Profit" value={`$${Math.round(data.bets.reduce((s,b)=>s+Number(b.profit||0),0)*100)/100}`} />
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Top Cappers</h3>
            {leaderboard.length===0 ? (
              <div className="text-sm text-gray-500">No cappers yet. Add some in the Cappers tab.</div>
            ) : (
              <ul className="space-y-2">
                {leaderboard.slice(0,5).map(c=> (
                  <li key={c.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-sm text-gray-500">Bets: {c.bets} • ROI: {(c.roi*100).toFixed(1)}%</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={()=>setSelectedCapper(c.id)}>View</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-2">Filters</h3>
          <div className="space-y-2">
            <select value={filterRange} onChange={e=>setFilterRange(e.target.value)} className="w-full border p-2 rounded">
              <option value="all">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="yesterday">Yesterday</option>
            </select>
            <div className="text-sm text-gray-600">Select a capper to see their performance chart.</div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold mb-2">Capper performance chart (selected)</h3>
        <CapperSelector cappers={data.cappers} onSelect={setSelectedCapper} selected={selectedCapper} />
        <PerformanceChart data={data} capperId={selectedCapper} filterRange={filterRange} />
      </div>
    </div>
  )
}

function StatCard({label,value}){
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function CappersPanel({ cappers, addCapper, editCapper, removeCapper, select, isAdmin }){
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-2">Cappers</h2>
      {isAdmin ? (
        <form onSubmit={e=>{e.preventDefault(); if(!name) return; addCapper(name); setName('')}} className="flex gap-2 mb-4">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Capper name" className="flex-1 border p-2 rounded" />
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-xl">Add</button>
        </form>
      ) : (
        <div className="mb-4 text-sm text-gray-500">Unlock admin to add or edit cappers.</div>
      )}

      {cappers.length===0 ? (
        <div className="text-sm text-gray-500">No cappers yet.</div>
      ) : (
        <ul className="space-y-2">
          {cappers.map(c=> (
            <li key={c.id} className="p-3 border rounded-xl flex justify-between items-center hover:bg-gray-50">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">ID: {c.id}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={()=>select(c.id)}>Bets</button>
                {isAdmin ? (
                  <>
                    <button className="px-2 py-1 border rounded" onClick={()=>{ setEditing(c.id); setEditName(c.name) }}>Edit</button>
                    <button className="px-2 py-1 border rounded" onClick={()=>{ if(confirm('Remove capper and all their bets?')) removeCapper(c.id) }}>Remove</button>
                  </>
                ) : null}
              </div>
              {editing===c.id && (
                <div className="mt-2 w-full">
                  <input className="border p-1 rounded mr-2" value={editName} onChange={e=>setEditName(e.target.value)} />
                  <button className="px-2 py-1 border rounded mr-2" onClick={()=>{ editCapper(c.id, editName); setEditing(null) }}>Save</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>setEditing(null)}>Cancel</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CapperSelector({cappers,onSelect,selected}){
  return (
    <div className="flex gap-2 mb-4">
      <select value={selected||''} onChange={e=>onSelect(e.target.value||null)} className="border p-2 rounded">
        <option value="">-- choose capper --</option>
        {cappers.map(c=> <option value={c.id} key={c.id}>{c.name}</option>)}
      </select>
    </div>
  )
}

function PerformanceChart({data, capperId, filterRange}){
  const bets = capperId ? data.bets.filter(b=>b.capperId===capperId) : data.bets
  const filtered = filterRange==='all' ? bets : filterByRange(bets, filterRange)
  const points = toCumulativeSeriesByDay(filtered)

  if (!points.length) {
    return <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No bets yet. Add bets to see performance.</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v)=>`$${Number(v).toFixed(2)}`} labelFormatter={(l)=>`Date: ${l}`} />
          <Line type="monotone" dataKey="cum" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// cumulative by day
function toCumulativeSeriesByDay(bets){
  const map = {}
  const sorted = bets.slice().sort((a,b)=> new Date(a.date) - new Date(b.date))
  let cum = 0
  for(const b of sorted){
    const d = String(b.date).slice(0,10)
    cum += Number(b.profit || 0)
    map[d] = cum
  }
  // convert to array of {date, cum} with all dates present between first and last
  const dates = Object.keys(map).sort()
  if(dates.length===0) return []
  const first = new Date(dates[0])
  const last = new Date(dates[dates.length-1])
  const out = []
  let cursor = new Date(first)
  let lastVal = 0
  while(cursor <= last){
    const key = cursor.toISOString().slice(0,10)
    if(key in map) lastVal = map[key]
    out.push({ date: key, cum: Math.round(lastVal*100)/100 })
    cursor.setDate(cursor.getDate()+1)
  }
  return out
}

function filterByRange(bets,range){
  const now = new Date()
  if(range==='7') { const cutoff=new Date(now.getTime()-7*24*60*60*1000); return bets.filter(b=>new Date(b.date)>=cutoff)}
  if(range==='30'){ const cutoff=new Date(now.getTime()-30*24*60*60*1000); return bets.filter(b=>new Date(b.date)>=cutoff)}
  if(range==='yesterday'){ const y=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1); const yend=new Date(now.getFullYear(),now.getMonth(),now.getDate()); return bets.filter(b=>{const d=new Date(b.date); return d>=y && d<yend})}
  return bets
}

function BetsPanel({ data, addBet, editBet, removeBet, computeProfit, setData, selectedCapper, setSelectedCapper, filterBets, statsFor, isAdmin }){
  const [form, setForm] = useState({ capperId: selectedCapper|| (data.cappers[0] && data.cappers[0].id) || '', date: new Date().toISOString().slice(0,10), sport: '', matchup: '', odds: '', stake: '', result: 'loss' })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(()=>{ if(selectedCapper) setForm(f=>({...f, capperId: selectedCapper})) },[selectedCapper])

  const previewProfit = computeProfit(form.odds, form.stake, form.result)

  function submit(e){
    e.preventDefault()
    if(!isAdmin){ alert('Unlock admin to add bets'); return }
    if(!form.capperId){ alert('Pick a capper'); return }
    if(!form.odds || !form.stake){ alert('Enter odds and stake'); return }
    addBet({ ...form, date: new Date(form.date).toISOString() })
    setForm({ ...form, matchup: '', odds: '', stake: '', result: 'loss' })
  }

  function startEdit(b){
    setEditing(b.id)
    setEditForm({ ...b })
  }
  function saveEdit(){
    if(!isAdmin){ alert('Unlock admin to edit bets'); return }
    editBet(editing, editForm)
    setEditing(null)
    setEditForm(null)
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-2">Add Bet</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-sm">Capper</label>
          <select className="w-full border p-2 rounded" value={form.capperId} onChange={e=>setForm({...form, capperId:e.target.value})}>
            <option value="" disabled>-- select --</option>
            {data.cappers.map(c=> <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Date</label>
          <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
        </div>
        <div>
          <label className="text-sm">Sport</label>
          <input className="w-full border p-2 rounded" value={form.sport} onChange={e=>setForm({...form, sport:e.target.value})} />
        </div>
        <div>
          <label className="text-sm">Matchup</label>
          <input className="w-full border p-2 rounded" value={form.matchup} onChange={e=>setForm({...form, matchup:e.target.value})} />
        </div>

        <div>
          <label className="text-sm">Odds (American)</label>
          <input className="w-full border p-2 rounded" value={form.odds} onChange={e=>setForm({...form, odds:e.target.value})} placeholder="e.g. -120 or +150" />
        </div>
        <div>
          <label className="text-sm">Stake</label>
          <input type="number" className="w-full border p-2 rounded" value={form.stake} onChange={e=>setForm({...form, stake:e.target.value})} min="0" step="0.01" />
        </div>
        <div>
          <label className="text-sm">Result</label>
          <select className="w-full border p-2 rounded" value={form.result} onChange={e=>setForm({...form, result:e.target.value})}>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="push">Push</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Profit preview: <span className={`${previewProfit>=0?'text-green-600':'text-red-600'} font-semibold`}>${Number(previewProfit).toFixed(2)}</span></div>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-xl">Add Bet</button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Recent Bets</h3>
        {data.bets.length===0 ? (
          <div className="text-sm text-gray-500">No bets yet.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Capper</th>
                <th className="p-2 border">Matchup</th>
                <th className="p-2 border">Odds</th>
                <th className="p-2 border">Stake</th>
                <th className="p-2 border">Result</th>
                <th className="p-2 border">Profit</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.bets.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(b=> (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{String(b.date).slice(0,10)}</td>
                  <td className="p-2">{data.cappers.find(c=>c.id===b.capperId)?.name||b.capperId}</td>
                  <td className="p-2">{b.matchup} <div className="text-xs text-gray-500">{b.sport}</div></td>
                  <td className="p-2">{b.odds}</td>
                  <td className="p-2">${Number(b.stake).toFixed(2)}</td>
                  <td className="p-2 capitalize">{b.result}</td>
                  <td className={`p-2 ${b.profit>=0? 'text-green-600':'text-red-600'}`}>${Number(b.profit).toFixed(2)}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      {isAdmin ? <button className="px-2 py-1 border rounded" onClick={()=>startEditInline(b, setEditing, setEditForm)}>Edit</button> : null}
                      {isAdmin ? <button className="px-2 py-1 border rounded" onClick={()=>{ if(confirm('Remove bet?')) removeBet(b.id) }}>Remove</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inline edit modal-like row */}
      {editing && editForm && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h4 className="font-semibold mb-2">Editing bet</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="text-sm">Date</label>
              <input type="date" className="w-full border p-2 rounded" value={String(editForm.date).slice(0,10)} onChange={e=>setEditForm({...editForm, date: new Date(e.target.value).toISOString()})} />
            </div>
            <div>
              <label className="text-sm">Odds</label>
              <input className="w-full border p-2 rounded" value={editForm.odds} onChange={e=>setEditForm({...editForm, odds: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Stake</label>
              <input type="number" className="w-full border p-2 rounded" value={editForm.stake} onChange={e=>setEditForm({...editForm, stake: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Result</label>
              <select className="w-full border p-2 rounded" value={editForm.result} onChange={e=>setEditForm({...editForm, result: e.target.value})}>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>saveEdit()}>Save changes</button>
            <button className="px-3 py-1 border rounded" onClick={()=>{ setEditing(null); setEditForm(null) }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  // helper for opening inline edit (captures closures)
  function startEditInline(b, setEditingLocal, setEditFormLocal){
    setEditingLocal(b.id)
    setEditFormLocal({...b})
  }
  function saveEdit(){ /* placeholder; actual save handled below via editBet */ }
}

function Leaderboard({ leaderboard }){
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-2">Leaderboard</h2>
      {leaderboard.length===0 ? (
        <div className="text-sm text-gray-500">No cappers yet.</div>
      ) : (
        <ol className="space-y-2">
          {leaderboard.map((c,idx)=> (
            <li key={c.id} className="p-3 border rounded-xl flex justify-between items-center">
              <div>
                <div className="font-semibold">#{idx+1} — {c.name}</div>
                <div className="text-sm text-gray-500">Bets: {c.bets} • ROI: {(c.roi*100).toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${Number(c.totalProfit).toFixed(2)}</div>
                <div className="text-xs text-gray-500">All-time profit</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function ExportJSON({ data, setData, STORAGE_KEY }){
  function exportJSON(){
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cappereal-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  function importJSON(e){
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result)
        if(!parsed || typeof parsed!== 'object' || !('cappers' in parsed) || !('bets' in parsed)) throw new Error('bad shape')
        setData(parsed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }catch(err){ alert('Invalid JSON') }
    }
    reader.readAsText(file)
  }
  function clearAll(){ if(window.confirm('Clear all local data?')){ localStorage.removeItem(STORAGE_KEY); location.reload() } }

  return (
    <div className="inline-flex items-center gap-2">
      <button onClick={exportJSON} className="px-2 py-1 border rounded">Export</button>
      <label className="px-2 py-1 border rounded cursor-pointer">
        Import
        <input type="file" accept="application/json" onChange={importJSON} className="hidden" />
      </label>
      <button onClick={clearAll} className="px-2 py-1 border rounded text-red-600">Clear</button>
    </div>
  )
}
