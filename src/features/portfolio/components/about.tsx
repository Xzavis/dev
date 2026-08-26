"use client"

import { DynamicGreeting } from "@/components/dynamic-greeting"
import { Markdown } from "@/components/markdown"
import { SectionCallout } from "@/components/section-callout"
import { Prose } from "@/components/ui/typography"
import { USER } from "@/features/portfolio/data/user"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelContent, PanelHeader, PanelTitle } from "./panel"

export function About() {
  const { t, l } = useTranslation()

  return (
    <Panel id="about">
      <SectionCallout side="right" className="top-8">
        {t.about.callout}
      </SectionCallout>

      <PanelHeader>
        <div className="flex items-end justify-between gap-4">
          <PanelTitle
            id="about-greeting"
            className="font-handwritten text-4xl leading-none font-medium tracking-normal"
          >
            <DynamicGreeting />
          </PanelTitle>
          <span className="pb-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {t.about.kicker}
          </span>
        </div>
      </PanelHeader>

      <PanelContent>
        <Prose className="text-justify">
          <Markdown>{l(USER.about, USER.aboutId)}</Markdown>
        </Prose>
      </PanelContent>
    </Panel>
  )
}
