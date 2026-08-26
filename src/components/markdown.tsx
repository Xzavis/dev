import ReactMarkdown from "react-markdown"
import rehypeExternalLinks from "rehype-external-links"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

// Uses the synchronous renderer (not `MarkdownAsync`) so this also works
// inside client components - none of the plugins here need async processing.
export function Markdown(props: React.ComponentProps<typeof ReactMarkdown>) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [
          rehypeExternalLinks,
          { target: "_blank", rel: "nofollow noopener noreferrer" },
        ],
      ]}
      {...props}
    />
  )
}
