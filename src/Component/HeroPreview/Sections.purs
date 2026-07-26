module Component.HeroPreview.Sections
  ( integrationsSection
  , renderSection
  , aiSection
  , embedSection
  , playSection
  , footerSection
  ) where

import Component.HeroPreview.SectionLabel (sectionLabel, spreadFolio)
import Data.Semigroup ((<>))
import React.Basic (JSX)
import Yoga.React.DOM.Attributes.Target (targetBlank)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Code (code) as H
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h2)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Pre (pre)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Span (span)
import Yoga.React.DOM.Internal (css, text)

installPill :: JSX
installPill =
  div { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full px-5 py-3 font-mono text-[clamp(0.875rem,1.4vw,1.25rem)] pointer-events-auto" }
    [ span { style: css { color: "#ff3b1a" } } "$"
    , span { className: "text-[#f5f1e8]" } "brew install --cask markgrafhq/tap/markgraf"
    , span { className: "text-[10px] uppercase tracking-[0.2em] text-[#8a94a8]" } "macOS · arm64"
    ]

integrationsSection :: JSX
integrationsSection =
  H.section
    { id: "integrations"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "02 / language"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "The source says what happened."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            "Declare topology once. Then write messages, nesting, and camera moves in reading order. Markgraf owns layout, routing, timing, and transitions."
        , div { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }
            [ renderCard "+ api \"API\"" "Declare a node. Edges establish topology; the layout is automatic."
            , renderCard "api ~> db \"SELECT\"" "Animate a message along an existing edge."
            , renderCard "inside api { … }" "Attach a real sub-diagram to a node instead of drawing another slide."
            , renderCard "into api · out" "Move the camera through the same hierarchy the source describes."
            ]
        ]
    , spreadFolio "02" "language"
    ]

renderSection :: JSX
renderSection =
  H.section
    { id: "render"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "03 / renderers"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "One scene. Every useful surface."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            "Canvas, SVG, terminal, native Metal, and video interpret the same semantic scene and timeline. The diagram does not fork when the output changes."
        , div { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }
            [ renderCard "browser" "Canvas player for live embeds and documentation."
            , renderCard "SVG" "Crisp vector rendering for React and static frames."
            , renderCard "--terminal" "ANSI playback over SSH or directly in a talk."
            , renderCard "--play" "Native Metal preview on macOS."
            , renderCard "-o demo.mp4" "H.264 video with ffmpeg bundled into the CLI."
            , renderCard "--still · --frame" "PNG or SVG at a named frame or exact timestamp."
            ]
        ]
    , spreadFolio "03" "renderers"
    ]

renderCard :: String -> String -> JSX
renderCard flag desc =
  div { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-5 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default" }
    [ div { className: "font-mono text-[#ff3b1a] text-sm mb-2" } flag
    , div { className: "text-[#c8cdd9] text-sm" } desc
    ]

aiSection :: JSX
aiSection =
  H.section
    { id: "ai"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "04 / hierarchy"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "One diagram can contain the next."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            "Model a system, put its containers inside the system node, then put components inside a container. The camera enters and leaves those levels without losing context."
        , div { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }
            [ renderCard "01 · system" "People, systems, and the messages crossing their boundary."
            , renderCard "02 · container" "Applications, stores, queues, and external dependencies."
            , renderCard "03 · component" "The parts worth explaining inside one deployable unit."
            ]
        ]
    , spreadFolio "04" "hierarchy"
    ]

embedSection :: JSX
embedSection =
  H.section
    { id: "embed"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "05 / integrations"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Keep the diagram beside the explanation."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            [ text "The same "
            , inlineCode "```markgraf"
            , text " fence can render in a README, a docs build, an editor preview, or your own React application."
            ]
        , div { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }
            [ embedCardLink "https://www.npmjs.com/package/@markgrafhq/markgraf-embed" "Embed" "Script-tag player for any webpage."
            , embedCardLink "https://markgrafhq.github.io/markgraf-react/" "React" "Component and hook with playback state."
            , embedCardLink "https://markgrafhq.github.io/mkdocs-markgraf/" "MkDocs" "Python plugin for fenced diagrams."
            , embedCardLink "https://markgrafhq.github.io/docusaurus-plugin-markgraf/" "Docusaurus" "Live diagrams in Docusaurus docs."
            , embedCardLink "https://markgrafhq.github.io/starlight-markgraf/" "Starlight" "Astro and Starlight integration."
            , embedCardLink "https://markgrafhq.github.io/markgraf-browser-extension/" "GitHub" "Render fences inline on github.com."
            , embedCardLink "https://github.com/markgrafhq/obsidian-markgraf" "Obsidian" "Live diagrams inside notes."
            , embedCardLink "https://github.com/markgrafhq/markgraf-vscode/releases/latest" "VS Code" "Syntax, diagnostics, and live preview."
            ]
        ]
    , spreadFolio "05" "integrations"
    ]

playSection :: JSX
playSection =
  H.section
    { id: "play"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "06 / authoring"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Write it yourself. Or give Claude the same language."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            "The format is plain text, small enough to review in a diff, and strict enough to validate before rendering. The Claude Code plugin teaches the same syntax rather than hiding it."
        , div { className: "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[min(64rem,92vw)]" }
            [ renderCard "markgraf --check diagram.markgraf" "Parse and validate without opening a renderer."
            , renderCard "git diff diagram.markgraf" "Review topology and story changes as ordinary text."
            ]
        , div { className: "mt-4 max-w-[min(64rem,92vw)]" }
            (aiCommand "/plugin install markgraf@i-am-the-slime")
        ]
    , spreadFolio "06" "authoring"
    ]

-- The same card as a link to its demo / repo, opening in a new tab so the
-- landing page stays put.
embedCardLink :: String -> String -> String -> JSX
embedCardLink href heading body =
  a
    { href
    , target: targetBlank
    , rel: "noopener noreferrer"
    , className: "block " <> cardClass <> " cursor-pointer"
    }
    (cardContent heading body)

cardClass :: String
cardClass = "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-4 sm:p-6 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors"

cardContent :: String -> String -> Array JSX
cardContent heading body =
  [ div { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a] sm:mb-3" } heading
  , p { className: "hidden sm:block text-sm text-[#c8cdd9] leading-relaxed" } body
  ]

aiCommand :: String -> JSX
aiCommand cmd =
  pre { className: "bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-lg px-5 py-4 text-sm leading-relaxed text-[#c8cdd9] font-mono overflow-x-auto" }
    (H.code {} cmd)

inlineCode :: String -> JSX
inlineCode source =
  H.code
    { className: "font-mono text-[#ff3b1a] bg-[#11162280] border border-[#2a3142] rounded px-1.5 py-0.5 text-[0.85em]" }
    source

footerSection :: JSX
footerSection =
  H.section
    { id: "install"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full flex flex-col gap-10" }
        [ sectionLabel "07 / install"
        , div { className: "flex flex-col gap-6" }
            [ h2
                { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] max-w-[min(56rem,90vw)]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                }
                "Install the macOS CLI."
            , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed" }
                "The Homebrew cask installs the Apple-silicon binary: native Metal preview, terminal playback, still images, sequence diagrams, and MP4 rendering with bundled ffmpeg."
            , div {} installPill
            ]
        , div { className: "flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono pt-8 border-t border-[#1a1f2e]" }
            [ footerLink "https://github.com/markgrafhq/homebrew-tap" "homebrew cask"
            , footerLink "https://github.com/markgrafhq/homebrew-tap/tree/main/examples" "examples"
            , footerLink "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
            , footerLink "https://discord.gg/tKfGrPYx" "discord"
            ]
        , div { className: "flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono" }
            [ span { className: "text-[#5a6478] uppercase tracking-wider text-xs" } "browser + docs"
            , footerLink "https://www.npmjs.com/package/@markgrafhq/markgraf-embed" "embed"
            , footerLink "https://markgrafhq.github.io/markgraf-react/" "react · storybook"
            , footerLink "https://markgrafhq.github.io/mkdocs-markgraf/" "mkdocs"
            , footerLink "https://markgrafhq.github.io/docusaurus-plugin-markgraf/" "docusaurus"
            , footerLink "https://markgrafhq.github.io/starlight-markgraf/" "starlight"
            , footerLink "https://markgrafhq.github.io/markgraf-browser-extension/" "github"
            , footerLink "https://github.com/markgrafhq/obsidian-markgraf" "obsidian"
            , footerLink "https://github.com/markgrafhq/markgraf-vscode/releases/latest" "vs code"
            ]
        ]
    , spreadFolio "07" "install"
    ]

footerLink :: String -> String -> JSX
footerLink href label =
  a { href, target: targetBlank, rel: "noopener noreferrer", className: "hover:text-[#f5f1e8] transition-colors" } label
