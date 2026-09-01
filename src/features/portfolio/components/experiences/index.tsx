"use client"

import React from "react"

import { SectionCallout } from "@/components/section-callout"
import type { Experience } from "@/lib/content/types"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { ExperienceItem } from "./experience-item"

export function Experiences({ experiences = [] }: { experiences?: Experience[] } = {}) {
  const { t } = useTranslation()

  return (
    <Panel id="experience">
      <SectionCallout side="left">{t.experiences.callout}</SectionCallout>

      <PanelHeader>
        <PanelTitle>
          {t.experiences.title}
          <PanelTitleSup>({experiences.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <div>
        {experiences.map((experience) => (
          <ExperienceItem key={experience.id} experience={experience} />
        ))}
      </div>
    </Panel>
  )
}
