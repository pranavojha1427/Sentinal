with open('src/components/AdminHotspots.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """            category: hotspot.infrastructure_category,
            location: hotspot.state,
            timeline: "24 months",
            hotspot_id: hotspot.id"""

replacement = """            category: hotspot.infrastructure_category,
            location: hotspot.exact_lat && hotspot.exact_lng ? `${hotspot.state} (${Number(hotspot.exact_lat).toFixed(4)}, ${Number(hotspot.exact_lng).toFixed(4)})` : hotspot.state,
            timeline: "24 months",
            hotspot_id: hotspot.id"""

content = content.replace(target, replacement)
with open('src/components/AdminHotspots.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
