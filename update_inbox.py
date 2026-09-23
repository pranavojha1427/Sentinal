import os

path = "src/components/WorkflowInbox.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix activeTab default
content = content.replace(
    'const [activeTab, setActiveTab] = useState("inbox");',
    'const [activeTab, setActiveTab] = useState(currentUser.role === "agency" ? "all" : "inbox");'
)

# Filter dismissed out of allRelevant
content = content.replace(
    'const allRelevant = proposals;',
    'const allRelevant = proposals.filter(p => p.status !== "dismissed");'
)

# Add Dismiss button logic
if 'action === "dismiss"' not in content:
    old_button_div = """            {activeTab === "all" && p.status === "bidding_open" && (
              <div className="mt-4 border-t pt-4">
                <BiddingBoard proposal={p} currentUser={currentUser} />
              </div>
            )}"""
    
    new_button_div = """            {activeTab === "all" && p.status === "bidding_open" && (
              <div className="mt-4 border-t pt-4">
                <BiddingBoard proposal={p} currentUser={currentUser} />
              </div>
            )}
            
            {activeTab === "all" && p.createdBy === currentUser.id && (p.status === "rejected_by_admin" || p.status === "rejected_by_ministry") && (
              <div className="mt-3 flex justify-end">
                <Button onClick={() => handleAction(p._id, "dismiss")} variant="outline" size="sm" className="text-slate-500">
                  Acknowledge & Dismiss
                </Button>
              </div>
            )}"""
    content = content.replace(old_button_div, new_button_div)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated WorkflowInbox UI")
