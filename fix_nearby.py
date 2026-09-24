import re

content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()

new_func = '''const loadNearbyProjects = async () => {
    setStep("feedback");
    try {
        let query = supabase.from("projects").select("id, project_name, sector, state");
        
        if (location) {
            // Reverse geocode to get the state
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`, {
                headers: { 'User-Agent': 'PragatiPulse/1.0' }
            });
            const geoData = await geoRes.json();
            const stateName = geoData.address?.state;
            
            if (stateName) {
                // Filter by state name. Use ilike to handle minor casing differences
                query = query.ilike("state", `%${stateName}%`);
            }
        }
        
        const { data } = await query.limit(5);
        if (data && data.length > 0) {
            setNearbyProjects(data);
        } else {
            // Fallback if no projects in their state, just get the first 5
            const fallback = await supabase.from("projects").select("id, project_name, sector, state").limit(5);
            if (fallback.data) setNearbyProjects(fallback.data);
        }
    } catch (e) {
        console.error("Error loading nearby projects:", e);
        // Fallback
        const { data } = await supabase.from("projects").select("id, project_name, sector, state").limit(5);
        if (data) setNearbyProjects(data);
    }
  };'''

content = re.sub(r'const loadNearbyProjects = async \(\) => \{.*?\n  \};', new_func, content, flags=re.DOTALL)
open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print("Updated loadNearbyProjects in CitizenPortal.tsx")
