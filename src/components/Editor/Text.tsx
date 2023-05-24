import React, { useRef } from 'react'
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Point,
  Range,
  Transforms
} from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import { BulletedListElement } from './types'

const SHORTCUTS: any = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six'
}

interface Iprops {
  initialValue: Descendant[]
  textChange: Function
}

const Text: React.FC<Iprops> = props => {
  const editorRef = useRef(null)
  const renderElement = React.useCallback(
    (props: any) => <Element {...props} />,
    []
  )
  const editor = React.useMemo(
    () => withShortcuts(withReact(withHistory(createEditor()))),
    []
  )

  const handleDOMBeforeInput = React.useCallback(
    (e: InputEvent) => {
      queueMicrotask(() => {
        const pendingDiffs = ReactEditor.androidPendingDiffs(editor)

        const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
          if (!diff.text.endsWith(' ')) {
            return false
          }

          const { text } = SlateNode.leaf(editor, path)
          const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1)
          if (!(beforeText in SHORTCUTS)) {
            return
          }

          const blockEntry = Editor.above(editor, {
            at: path,
            match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
          })
          if (!blockEntry) {
            return false
          }

          const [, blockPath] = blockEntry
          return Editor.isStart(editor, Editor.start(editor, path), blockPath)
        })

        if (scheduleFlush) {
          ReactEditor.androidScheduleFlush(editor)
        }
      })
    },
    [editor]
  )

  const onchange = (value: any) => {
    props.textChange(value)
  }

  return (
    <div className="px-4  h-full rounded border border-solid border-gray-300 bg-white">
      <Slate
        editor={editor}
        value={props.initialValue}
        onChange={value => onchange(value)}
      >
        <Editable
          onDOMBeforeInput={handleDOMBeforeInput}
          renderElement={renderElement}
          placeholder="Write some markdown..."
          spellCheck
        />
      </Slate>
    </div>
  )
}

export default Text

const withShortcuts = (editor: any) => {
  const { deleteBackward, insertText } = editor

  editor.insertText = (text: any) => {
    const { selection } = editor

    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor, focus: start }
      const beforeText = Editor.string(editor, range) + text.slice(0, -1)
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor)
        }

        const newProperties: Partial<SlateElement> = {
          type
        }
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
        })

        if (type === 'list-item') {
          const list: BulletedListElement = {
            type: 'bulleted-list',
            children: []
          }
          Transforms.wrapNodes(editor, list as any, {
            match: n =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'list-item'
          })
        }

        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args: any[]) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph'
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'bulleted-list',
              split: true
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    default:
      return <p {...attributes}>{children}</p>
  }
}
