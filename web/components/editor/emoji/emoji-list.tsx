import clsx from 'clsx'
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import type { EmojiItem } from '@tiptap-pro/extension-emoji'
import type { SuggestionProps } from '@tiptap/suggestion'

// copied from https://tiptap.dev/api/nodes/mention#usage and https://tiptap.dev/api/nodes/emoji
export const EmojiList = forwardRef(
  (props: SuggestionProps<EmojiItem>, ref) => {
    const { items, command } = props

    const [selectedIndex, setSelectedIndex] = useState(0)
    useEffect(() => setSelectedIndex(0), [items])

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) command(item)
    }

    const onUp = () =>
      setSelectedIndex((i) => (i + items.length - 1) % items.length)
    const onDown = () => setSelectedIndex((i) => (i + 1) % items.length)
    const onEnter = () => selectItem(selectedIndex)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: any) => {
        if (event.key === 'ArrowUp') {
          onUp()
          return true
        }
        if (event.key === 'ArrowDown') {
          onDown()
          return true
        }
        if (event.key === 'Enter') {
          onEnter()
          return true
        }
        return false
      },
    }))

    return (
      <div className="w-42 absolute z-10 overflow-x-hidden rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {!items.length ? (
          <span className="m-1 whitespace-nowrap">No results...</span>
        ) : (
          items.map((item, i) => (
            <button
              className={clsx(
                'flex h-8 w-full cursor-pointer select-none items-center gap-2 truncate px-4',
                selectedIndex === i
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-900'
              )}
              key={item.shortcodes[0]}
              onClick={() => selectItem(i)}
            >
              {item.emoji} {item.name}
            </button>
          ))
        )}
      </div>
    )
  }
)
