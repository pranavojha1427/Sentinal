with open('src/components/AdminHotspots.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = """    // Fetch unassigned complaints (no hotspot_id)
    const { data: cData } = await supabase.from('citizen_requests').select('*').is('hotspot_id', null).order('created_at', { ascending: false });"""

replacement1 = """    // Fetch unassigned complaints (no hotspot_id)
    let complaintsQuery = supabase.from('citizen_requests').select('*').is('hotspot_id', null).order('created_at', { ascending: false });
    if (currentUser?.role === 'state_admin' && currentUser?.state) {
        complaintsQuery = complaintsQuery.eq('state', currentUser.state);
    }
    const { data: cData } = await complaintsQuery;"""

content = content.replace(target1, replacement1)

target2 = """    // Fetch existing hotspots
    const { data: hData } = await supabase.from('demand_hotspots')
        .select(`
            *,
            inspectors ( name, phone )
        `)
        .order('created_at', { ascending: false });"""

replacement2 = """    // Fetch existing hotspots
    let hotspotsQuery = supabase.from('demand_hotspots').select(`*, inspectors ( name, phone )`).order('created_at', { ascending: false });
    if (currentUser?.role === 'state_admin' && currentUser?.state) {
        hotspotsQuery = hotspotsQuery.eq('state', currentUser.state);
    }
    const { data: hData } = await hotspotsQuery;"""

content = content.replace(target2, replacement2)

# Ensure UI renders for state_admin instead of admin for the create section
target3 = """{currentUser?.role === 'admin' && ("""
replacement3 = """{(currentUser?.role === 'admin' || currentUser?.role === 'state_admin') && ("""
content = content.replace(target3, replacement3)

with open('src/components/AdminHotspots.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
