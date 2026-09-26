with open('src/components/AdminHotspots.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: project_title,
            description: description,
            amount: amount,
            category: hotspot.infrastructure_category,
            location: hotspot.exact_lat && hotspot.exact_lng ? `${hotspot.state} (${Number(hotspot.exact_lat).toFixed(4)}, ${Number(hotspot.exact_lng).toFixed(4)})` : hotspot.state,
            timeline: "24 months",
            hotspot_id: hotspot.id
        })
    });"""

replacement = """    // Append map coordinates to description so the Admin can see exactly where it was pinned
    const coordsStr = hotspot.exact_lat && hotspot.exact_lng ? `\\n\\n[Map Pinned Coordinates: Lat ${Number(hotspot.exact_lat).toFixed(6)}, Lng ${Number(hotspot.exact_lng).toFixed(6)}]` : "";
    const fullDetails = description + coordsStr;

    const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            project_name: project_title,
            details: fullDetails,
            expected_expenditure: amount,
            sector: hotspot.infrastructure_category,
            state: hotspot.state,
            hotspot_id: hotspot.id
        })
    });"""

content = content.replace(target, replacement)
with open('src/components/AdminHotspots.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
