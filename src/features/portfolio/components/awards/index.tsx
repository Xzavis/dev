"use client"

import { CollapsibleList } from "@/components/collapsible-list"
import { SectionCallout } from "@/components/section-callout"
import defaultAwards from "@/content/awards.json"
import type { Award } from "@/lib/content/types"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { AwardItem } from "./award-item"

export function Awards({ awards = defaultAwards }: { awards?: Award[] } = {}) {
  const { t } = useTranslation()

  return (
    <Panel id="awards">
      <SectionCallout side="right" className="top-10">
        {t.awards.callout}
      </SectionCallout>

      <PanelHeader>
        <PanelTitle>
          {t.awards.title}
          <PanelTitleSup>({awards.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <CollapsibleList
        items={awards}
        max={3}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <AwardItem award={item} />}
      />
    </Panel>
  )
}
