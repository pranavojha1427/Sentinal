with open('src/app/api/bids/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

duplicate_check = """  const existingBid = await db.collection(BIDS_COLLECTION).findOne({ proposalId: body.proposalId, agencyName: session.agency });
  if (existingBid) {
    return NextResponse.json({ error: "You have already placed a bid for this proposal." }, { status: 400 });
  }

  const bid = {"""

content = content.replace('  const bid = {', duplicate_check)

with open('src/app/api/bids/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
