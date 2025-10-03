import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Input({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: 'block', marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #ddd',
          borderRadius: 6,
        }}
      />
    </label>
  )
}

export default function OKRPage() {
  const [objectives, setObjectives] = useState([])
  const [keysByObjId, setKeysByObjId] = useState({})
  const [loading, setLoading] = useState(false)

  const [newObjectiveTitle, setNewObjectiveTitle] = useState('')
  const [newObjectiveOwner, setNewObjectiveOwner] = useState('')
  const [newKrTitle, setNewKrTitle] = useState('')
  const [newKrTarget, setNewKrTarget] = useState('')
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('')

  const canCreateObjective = useMemo(() => newObjectiveTitle.trim().length > 0, [newObjectiveTitle])
  const canCreateKR = useMemo(
    () => selectedObjectiveId && newKrTitle.trim().length > 0,
    [selectedObjectiveId, newKrTitle]
  )

  async function loadData() {
    setLoading(true)
    try {
      const { data: objs, error: objErr } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false })
      if (objErr) throw objErr
      setObjectives(objs || [])

      if ((objs || []).length) {
        const ids = (objs || []).map((o) => o.id)
        const { data: krs, error: krErr } = await supabase
          .from('key_results')
          .select('*')
          .in('objective_id', ids)
        if (krErr) throw krErr
        const group = {}
        for (const kr of krs || []) {
          group[kr.objective_id] = group[kr.objective_id] || []
          group[kr.objective_id].push(kr)
        }
        setKeysByObjId(group)
      } else {
        setKeysByObjId({})
      }
    } catch (e) {
      console.error(e)
      alert(e.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreateObjective() {
    if (!canCreateObjective) return
    setLoading(true)
    try {
      const { error } = await supabase.from('objectives').insert([
        { title: newObjectiveTitle.trim(), owner: newObjectiveOwner.trim() || null },
      ])
      if (error) throw error
      setNewObjectiveTitle('')
      setNewObjectiveOwner('')
      await loadData()
    } catch (e) {
      console.error(e)
      alert(e.message || 'Không thể tạo Objective')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateKR() {
    if (!canCreateKR) return
    const parsedTarget = newKrTarget ? Number(newKrTarget) : null
    if (newKrTarget && Number.isNaN(parsedTarget)) {
      alert('Target phải là số')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.from('key_results').insert([
        {
          objective_id: selectedObjectiveId,
          title: newKrTitle.trim(),
          target_value: parsedTarget,
        },
      ])
      if (error) throw error
      setNewKrTitle('')
      setNewKrTarget('')
      await loadData()
    } catch (e) {
      console.error(e)
      alert(e.message || 'Không thể tạo Key Result')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h2>OKR cơ bản</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Tạo Objective</h3>
          <Input
            label="Tiêu đề"
            value={newObjectiveTitle}
            onChange={setNewObjectiveTitle}
            placeholder="VD: Tăng trưởng người dùng Q4"
          />
          <Input
            label="Owner (tuỳ chọn)"
            value={newObjectiveOwner}
            onChange={setNewObjectiveOwner}
            placeholder="VD: hong.vu"
          />
          <button disabled={!canCreateObjective || loading} onClick={handleCreateObjective}>
            {loading ? 'Đang xử lý...' : 'Thêm Objective'}
          </button>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Thêm Key Result</h3>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Objective</div>
            <select
              value={selectedObjectiveId}
              onChange={(e) => setSelectedObjectiveId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6 }}
            >
              <option value="">-- chọn Objective --</option>
              {objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Tiêu đề KR"
            value={newKrTitle}
            onChange={setNewKrTitle}
            placeholder="VD: Tăng DAU lên 20%"
          />
          <Input
            label="Target (số, tuỳ chọn)"
            value={newKrTarget}
            onChange={setNewKrTarget}
            placeholder="VD: 20"
          />
          <button disabled={!canCreateKR || loading} onClick={handleCreateKR}>
            {loading ? 'Đang xử lý...' : 'Thêm Key Result'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Danh sách Objectives</h3>
        {loading && <div>Đang tải...</div>}
        {!loading && objectives.length === 0 && <div>Chưa có Objective nào</div>}
        {!loading && objectives.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {objectives.map((o) => (
              <div key={o.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600 }}>{o.title}</div>
                {o.owner && <div style={{ color: '#666', fontSize: 13 }}>Owner: {o.owner}</div>}
                <div style={{ marginTop: 8, fontSize: 14, color: '#333' }}>Key Results:</div>
                <ul style={{ marginTop: 6 }}>
                  {(keysByObjId[o.id] || []).map((kr) => (
                    <li key={kr.id}>
                      {kr.title}
                      {kr.target_value != null && <span> — Target: {kr.target_value}</span>}
                    </li>
                  ))}
                  {!(keysByObjId[o.id] || []).length && <li>Chưa có KR</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


