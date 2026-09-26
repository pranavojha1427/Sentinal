with open('src/components/BiddingBoard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export function BiddingBoard({ proposal, currentUser }: any) {',
    'export function BiddingBoard({ proposal, currentUser, agencyRanks }: any) {'
)

# the rank render is currently:
#                  {b.agencyRank && (
#                    <div className="text-xs font-mono mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 inline-block rounded">
#                      Rank: #{b.agencyRank} | Delay: {b.delayFreq}%
#                    </div>
#                  )}

new_render = """
                  {(() => {
                    const rankObj = agencyRanks?.find((r: any) => r.agency === b.agencyName);
                    const agencyRank = rankObj ? agencyRanks.indexOf(rankObj) + 1 : (b.agencyRank || "Unranked");
                    const delayFreq = rankObj ? rankObj.delay_frequency_pct : (b.delayFreq || "0");
                    const costOverrun = rankObj ? rankObj.avg_cost_overrun_pct : (b.costOverrun || "0");
                    
                    return (
                      <div className="text-xs font-mono mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 inline-block rounded">
                        Rank: #{agencyRank} | Delay: {delayFreq}% | Cost Overrun: {costOverrun}%
                      </div>
                    );
                  })()}
"""

import re
content = re.sub(
    r'\{b\.agencyRank && \(\s*<div className="text-xs font-mono mt-1 bg-yellow-100 text-yellow-800 px-2 py-0\.5 inline-block rounded">\s*Rank: #\{b\.agencyRank\} \| Delay: \{b\.delayFreq\}%\s*</div>\s*\)\}',
    new_render,
    content,
    flags=re.DOTALL
)

with open('src/components/BiddingBoard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
