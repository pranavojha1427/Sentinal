with open('src/components/WorkflowInbox.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export function WorkflowInbox({ currentUser }: any) {',
    'export function WorkflowInbox({ currentUser, agencyRanks }: any) {'
)

content = content.replace(
    '<BiddingBoard proposal={p} currentUser={currentUser} />',
    '<BiddingBoard proposal={p} currentUser={currentUser} agencyRanks={agencyRanks} />'
)

with open('src/components/WorkflowInbox.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
