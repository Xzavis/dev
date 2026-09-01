import {
  LinkIcon,
  MapPinIcon,
  MarsIcon,
  NonBinaryIcon,
  PhoneIcon,
  VenusIcon,
} from "lucide-react"

import profileData from "@/content/profile.json"
import type { Profile } from "@/lib/content/types"
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

export function Overview({ profile = profileData }: { profile?: Profile } = {}) {
  return (
    <Panel id="overview" className="after:content-none">
      <h2 className="sr-only">Overview</h2>

      <PanelContent className="space-y-2.5">
        {(profile.jobs ?? []).map((job, index) => (
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
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`}
                rel="noopener noreferrer nofollow"
                aria-label={`Location: ${profile.address}`}
              >
                {profile.address}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          {/* Right column */}
          <CurrentLocalTimeItem timeZone={profile.timeZone} />

          {/* Left column */}
          {profile.phone && (
            <IntroItem>
              <IntroItemIcon>
                <PhoneIcon />
              </IntroItemIcon>
              <IntroItemContent>
                <IntroItemLink
                  href={`tel:${profile.phone.replace(/[\s-]/g, "")}`}
                  aria-label={`Phone: ${profile.phone}`}
                >
                  {profile.phone}
                </IntroItemLink>
              </IntroItemContent>
            </IntroItem>
          )}

          {/* Right column */}
          <EmailItem email={profile.email} />

          {/* Left column */}
          <IntroItem>
            <IntroItemIcon>
              <LinkIcon />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink
                href={profile.website}
                aria-label={`Personal website: ${urlToName(profile.website)}`}
              >
                {urlToName(profile.website)}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>

          {/* Right column */}
          <IntroItem>
            <IntroItemIcon>{getGenderIcon(profile.gender)}</IntroItemIcon>
            <IntroItemContent aria-label={`Pronouns: ${profile.pronouns}`}>
              {profile.pronouns}
            </IntroItemContent>
          </IntroItem>
        </div>
      </PanelContent>
    </Panel>
  )
}

function getGenderIcon(gender?: string) {
  switch (gender) {
    case "male":
      return <MarsIcon />
    case "female":
      return <VenusIcon />
    case "non-binary":
      return <NonBinaryIcon />
    default:
      return <MarsIcon />
  }
}
