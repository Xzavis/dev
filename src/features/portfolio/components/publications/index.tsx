"use client"

import defaultPublications from "@/content/publications.json"
import type { Publication } from "@/lib/content/types"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { PublicationItem } from "./publication-item"

export function Publications({ publications = defaultPublications }: { publications?: Publication[] } = {}) {
  const { t } = useTranslation()

  return (
    <Panel id="publications">
      <PanelHeader>
        <PanelTitle>
          {t.publications.title}
          <PanelTitleSup>({publications.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <div className="divide-y divide-line">
        {publications.map((pub) => (
          <PublicationItem key={pub.id} publication={pub} />
        ))}
      </div>
    </Panel>
  )
}
