"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { Command } from "cmdk"
import { Search, ArrowRight, CornerDownLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@workspace/ui/lib/utils"

export interface CommandMenuItem {
  id: string
  title: string
  group?: string
  icon?: React.ReactNode
  onSelect?: () => void
}

export interface CommandMenuGroup {
  title: string
  items: CommandMenuItem[]
}

export interface CommandMenuProps {
  groups: CommandMenuGroup[]
  placeholder?: string
  emptyMessage?: string
  brandName?: string
  triggerClassName?: string
  triggerLabel?: string
  shortcutKey?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const groupHeadingClassName =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60"

function SearchItem({
  title,
  subtitle,
  icon,
  onSelect,
}: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  onSelect: () => void
}) {
  return (
    <Command.Item
      value={`${subtitle ?? ""} ${title}`}
      onSelect={onSelect}
      className="group/item relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none data-[selected=true]:bg-black/5 dark:data-[selected=true]:bg-white/10 data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground/70 group-data-[selected=true]/item:text-primary">
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{title}</span>
        {subtitle ? <span className="truncate text-xs text-muted-foreground/60">{subtitle}</span> : null}
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 ease-out group-data-[selected=true]/item:opacity-100 group-data-[selected=true]/item:translate-x-0" />
    </Command.Item>
  )
}

function CommandMenu({
  groups,
  placeholder = "Search...",
  emptyMessage = "No results found",
  brandName = "Command Menu",
  triggerClassName,
  triggerLabel = "Search...",
  shortcutKey = "K",
  open: controlledOpen,
  onOpenChange,
}: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = React.useMemo(
    () => (isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen),
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === shortcutKey.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen, shortcutKey])

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    } else {
      setQuery("")
    }
  }, [open])

  const handleSelect = React.useCallback((item: CommandMenuItem) => {
    setOpen(false)
    item.onSelect?.()
  }, [setOpen])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center justify-center md:justify-start gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border-0 md:border md:border-input/50 md:hover:border-input hover:bg-accent/50 md:px-3 md:py-2 relative h-9 w-9 md:w-40 lg:w-56 rounded-md md:rounded-lg bg-transparent md:bg-muted/30 text-sm font-normal text-muted-foreground",
          triggerClassName
        )}
      >
        <Search className="h-[1.2rem] w-[1.2rem] md:h-4 md:w-4 opacity-70 group-hover:opacity-100 md:opacity-50 md:group-hover:opacity-70 transition-opacity" />
        <span className="hidden lg:inline-flex">{triggerLabel}</span>
        <span className="hidden md:inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-0.5 rounded-md border bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70 sm:flex">
          <span className="text-xs">⌘</span>{shortcutKey}
        </kbd>
      </button>

      {mounted && ReactDOM.createPortal(
        <AnimatePresence mode="sync">
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                transition={{
                  duration: 0.25,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-[680px] -translate-x-1/2 -translate-y-1/2 p-4"
              >
                <Command
                  label="Spotlight Search"
                  className="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-[#F5F4F3] dark:bg-[#121212] backdrop-blur-xl [box-shadow:0_0_0_1px_rgba(255,255,255,0.8)_inset,0_0_24px_4px_rgba(255,255,255,0.09)_inset,0_24px_64px_-12px_rgba(0,0,0,0.12),0_8px_24px_-4px_rgba(0,0,0,0.08)] dark:[box-shadow:0_0_0_1px_rgba(255,255,255,0.06)_inset,0_0_24px_4px_rgba(255,255,255,0.02)_inset,0_24px_64px_-12px_rgba(0,0,0,0.6),0_8px_24px_-4px_rgba(0,0,0,0.4)] tracking-tight"
                  shouldFilter={true}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent" />

                  <div className="p-2">
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 dark:border-zinc-700/40 bg-zinc-100/70 dark:bg-zinc-800/50 px-3 py-2.5 [box-shadow:inset_0_1px_2px_rgba(0,0,0,0.04)] dark:[box-shadow:inset_0_1px_2px_rgba(0,0,0,0.2)]">
                      <Search className="h-4 w-4 text-muted-foreground/50" />
                      <Command.Input
                        ref={inputRef}
                        value={query}
                        onValueChange={setQuery}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent text-sm font-normal outline-none placeholder:text-muted-foreground/60"
                        autoFocus
                      />
                      {query && (
                        <button
                          onClick={() => setQuery("")}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <Command.List className="max-h-[400px] overflow-y-auto overscroll-contain p-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_bottom,transparent,black_2rem,black_calc(100%-2rem),transparent)]">
                    <Command.Empty className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                        <Search className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                      <p className="text-xs text-muted-foreground/60">Try searching for something else</p>
                    </Command.Empty>

                    {groups.map((group) => (
                      <Command.Group
                        key={group.title}
                        heading={group.title}
                        className={groupHeadingClassName}
                      >
                        {group.items.map((item) => (
                          <SearchItem
                            key={item.id}
                            title={item.title}
                            icon={item.icon}
                            onSelect={() => handleSelect(item)}
                          />
                        ))}
                      </Command.Group>
                    ))}
                  </Command.List>

                  <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <kbd className="flex h-5 w-5 items-center justify-center rounded border bg-background font-mono text-[10px] text-muted-foreground shadow-sm">
                        <CornerDownLeft className="h-3 w-3" />
                      </kbd>
                      <span>Go To Page</span>
                    </div>
                    <span className="text-xs text-muted-foreground/40">{brandName}</span>
                  </div>
                </Command>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

CommandMenu.displayName = "CommandMenu"

export { CommandMenu }
