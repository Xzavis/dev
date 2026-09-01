"use client"

import { CollapsibleList } from "@/components/collapsible-list"
import defaultCertifications from "@/content/certifications.json"
import type { Certification } from "@/lib/content/types"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { CertificationItem } from "./certification-item"

export function Certifications({ certifications = defaultCertifications }: { certifications?: Certification[] } = {}) {
  const { t } = useTranslation()

  return (
    <Panel id="certs">
      <PanelHeader>
        <PanelTitle>
          {t.certifications.title}
          <PanelTitleSup>({certifications.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <CollapsibleList
        items={certifications}
        max={3}
        renderItem={(item) => <CertificationItem certification={item} />}
      />
    </Panel>
  )
}
