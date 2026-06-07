module Component.HeroPreview.Sections
  ( integrationsSection
  , renderSection
  , aiSection
  , embedSection
  , playSection
  , footerSection
  ) where

import Component.HeroPreview.SectionLabel (sectionLabel, spreadFolio)
import React.Basic (JSX)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Button (button)
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
  div { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-[clamp(0.875rem,1.4vw,1.25rem)] pointer-events-auto" }
    [ span { style: css { color: "#ff3b1a" } } "$"
    , span { className: "text-[#f5f1e8]" } "brew install markgrafhq/tap/markgraf"
    , button
        { type: "button"
        , className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-[#8a94a8] hover:text-[#f5f1e8] transition-colors px-3 py-1.5 rounded-full bg-[#0f0f0f] border border-[#2a3142] cursor-pointer"
        }
        "copy"
    ]

integrationsSection :: JSX
integrationsSection =
  H.section
    { id: "integrations"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "02 / integrations"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Integrations"
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            [ text "One "
            , inlineCode "```markgraf"
            , text " block, every surface you work on — docs, code review, your editor, the command line."
            ]
        , div { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }
            [ embedCard "GitHub" "Chrome extension renders markgraf blocks inline on github.com."
            , embedCard "MkDocs" "Python plugin — ```markgraf fences become live players."
            , embedCard "Starlight" "Astro Starlight docs."
            , embedCard "Astro" "Astro integration."
            , embedCard "React" "@markgrafhq/markgraf-react — drop-in component."
            , embedCard "macOS" "Native Metal player + CLI."
            , embedCard "Linux" "CLI, statically linked."
            , embedCard "Windows" "CLI."
            , embedCard "mp4" "Render to video — ffmpeg embedded, no deps."
            ]
        ]
    , spreadFolio "02" "integrations"
    ]

renderSection :: JSX
renderSection =
  H.section
    { id: "render"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "03 / render"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "mp4, SVG, GIF, or sequence diagram."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            "mp4, animated SVG, gif, or a static sequence diagram. ffmpeg is statically linked, so mp4 works on a fresh machine with nothing else installed."
        , div { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }
            [ renderCard "--play" "native macOS player"
            , renderCard "-o out.mp4" "mp4 — ffmpeg embedded"
            , renderCard "--svg" "animated svg — vector"
            , renderCard "--gif" "keyframe gif"
            , renderCard "--sequence" "static sequence diagram"
            , renderCard "--check" "typecheck without rendering"
            ]
        ]
    , spreadFolio "03" "render"
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
        [ sectionLabel "04 / ai authoring"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Claude writes the diagram."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            [ text "A Claude Code plugin teaches Claude the syntax and authoring rules. You describe the system in plain English, Claude produces the "
            , inlineCode ".markgraf"
            , text " source."
            ]
        , div { className: "flex flex-col gap-3 max-w-2xl" }
            [ aiCommand "/plugin marketplace add i-am-the-slime/claude-plugins"
            , aiCommand "/plugin install markgraf@i-am-the-slime"
            ]
        ]
    , spreadFolio "04" "ai"
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
            "GitHub and docs sites."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            [ text "The same "
            , inlineCode "```markgraf"
            , text " block plays in your README and in your docs."
            ]
        , div { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }
            [ embedCard "GitHub integration" "Browser extension that renders markgraf code blocks inline on github.com."
            , embedCard "Docs plugins" "Docusaurus, Astro Starlight, MkDocs."
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
        [ sectionLabel "06 / play"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Trace any shape."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed" }
            "Balls follow the play-button outline. Swap the path and the swarm traces anything — SVG next."
        ]
    , spreadFolio "06" "play"
    ]

embedCard :: String -> String -> JSX
embedCard heading body =
  div { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-6 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default" }
    [ div { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a] mb-3" } heading
    , p { className: "text-sm text-[#c8cdd9] leading-relaxed" } body
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
        [ sectionLabel "06 / install"
        , div { className: "flex flex-col gap-6" }
            [ h2
                { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] max-w-[min(56rem,90vw)]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                }
                "Install"
            , div {} installPill
            ]
        , div { className: "flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono pt-8 border-t border-[#1a1f2e]" }
            [ footerLink "https://github.com/markgrafhq/homebrew-tap" "tap"
            , footerLink "https://github.com/markgrafhq/homebrew-tap/tree/main/examples" "examples"
            , footerLink "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
            , footerLink "https://discord.gg/tKfGrPYx" "discord"
            ]
        , div { className: "flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono" }
            [ span { className: "text-[#5a6478] uppercase tracking-wider text-xs" } "live demos"
            , footerLink "https://markgrafhq.github.io/markgraf-embed/" "embed"
            , footerLink "https://markgrafhq.github.io/markgraf-react/" "react · storybook"
            , footerLink "https://markgrafhq.github.io/mkdocs-markgraf/" "mkdocs"
            , footerLink "https://markgrafhq.github.io/docusaurus-plugin-markgraf/" "docusaurus"
            , footerLink "https://markgrafhq.github.io/starlight-markgraf/" "starlight"
            , footerLink "https://markgrafhq.github.io/markgraf-browser-extension/" "browser extension"
            ]
        ]
    , spreadFolio "07" "install"
    ]

footerLink :: String -> String -> JSX
footerLink href label =
  a { href, className: "hover:text-[#f5f1e8] transition-colors" } label
