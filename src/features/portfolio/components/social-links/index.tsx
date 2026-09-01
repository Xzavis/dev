import defaultLinks from "@/content/social-links.json"
import type { SocialLink } from "@/lib/content/types"

import { Panel } from "../panel"
import { SocialLinkItem } from "./social-link-item"

export function SocialLinks({ links = defaultLinks }: { links?: SocialLink[] } = {}) {
  return (
    <Panel id="social">
      <h2 className="sr-only">Social Links</h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {links.map((link, index) => {
          return <SocialLinkItem key={index} index={index} {...link} />
        })}
      </div>
    </Panel>
  )
}
