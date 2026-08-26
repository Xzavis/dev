import {
  LinkIcon,
  MapPinIcon,
  MarsIcon,
  NonBinaryIcon,
  PhoneIcon,
  VenusIcon,
} from "lucide-react"

import { USER } from "@/features/portfolio/data/user"
import type { User } from "@/features/portfolio/types/user"
import { urlToName } from "@/utils/url"

import { Panel, PanelContent } from "../panel"
import { CurrentLocalTimeItem } from "./current-local-time-item"
import { EmailItem } from "./email-item"
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item"
import { JobItem } from "./job-item"

export function Overview() {
  return (
    <Panel id="overview" className="after:content-none">
      <h2 className="sr-only">Overview</h2>

      <PanelContent className="space-y-2.5">
        {USER.jobs.map((job, index) => (
          <JobItem
            key={index}
            title={job.title}
            company={job.company}
            website={job.website}
            experienceId={job.experienceId}
          />
        ))}

        <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
          {/* Left column */}
          <IntroItem>
            <IntroItemIcon>
              <MapPinIcon />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(USER.address)}`}
                rel="noopener noreferrer nofollow"
                aria-label={`Location: ${USER.address}`}
              >
                {USER.address}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          {/* Right column */}
          <CurrentLocalTimeItem timeZone={USER.timeZone} />

          {/* Left column */}
          {USER.phone && (
            <IntroItem>
              <IntroItemIcon>
                <PhoneIcon />
              </IntroItemIcon>
              <IntroItemContent>
                <IntroItemLink
                  href={`tel:${USER.phone.replace(/[\s-]/g, "")}`}
                  aria-label={`Phone: ${USER.phone}`}
                >
                  {USER.phone}
                </IntroItemLink>
              </IntroItemContent>
            </IntroItem>
          )}

          {/* Right column */}
          <EmailItem email={USER.email} />

          {/* Left column */}
          <IntroItem>
            <IntroItemIcon>
              <LinkIcon />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink
                href={USER.website}
                aria-label={`Personal website: ${urlToName(USER.website)}`}
              >
                {urlToName(USER.website)}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          {/* Right column */}
          <IntroItem>
            <IntroItemIcon>{getGenderIcon(USER.gender)}</IntroItemIcon>
            <IntroItemContent aria-label={`Pronouns: ${USER.pronouns}`}>
              {USER.pronouns}
            </IntroItemContent>
          </IntroItem>
        </div>
      </PanelContent>
    </Panel>
  )
}

function getGenderIcon(gender: User["gender"]) {
  switch (gender) {
    case "male":
      return <MarsIcon />
    case "female":
      return <VenusIcon />
    case "non-binary":
      return <NonBinaryIcon />
  }
}
