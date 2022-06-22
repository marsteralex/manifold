import { XIcon } from '@heroicons/react/outline'
import {
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/solid'
import clsx from 'clsx'
import { Comment } from 'common/comment'
import { User } from 'common/user'
import { formatMoney } from 'common/util/format'
import { debounce, sum, sumBy } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CommentTips } from 'web/hooks/use-tip-txns'
import { useUser } from 'web/hooks/use-user'
import { transact } from 'web/lib/firebase/fn-call'
import { track } from 'web/lib/service/analytics'
import { Row } from './layout/row'
import { Tooltip } from './tooltip'

export function Tipper(prop: { comment: Comment; tips: CommentTips }) {
  const { comment, tips } = prop

  const me = useUser()
  const myId = me?.id ?? ''
  const savedTip = tips[myId] ?? 0

  const [localTip, setLocalTip] = useState(savedTip)
  // listen for user being set
  const initialized = useRef(false)
  useEffect(() => {
    if (tips[myId] && !initialized.current) {
      setLocalTip(tips[myId])
      initialized.current = true
    }
  }, [tips, myId])

  const total = sum(Object.values(tips)) - savedTip + localTip

  // declare debounced function only on first render
  const [saveTip] = useState(() =>
    debounce(async (user: User, change: number) => {
      if (change === 0) {
        return
      }

      await transact({
        amount: change,
        fromId: user.id,
        fromType: 'USER',
        toId: comment.userId,
        toType: 'USER',
        token: 'M$',
        category: 'TIP',
        data: {
          contractId: comment.contractId,
          commentId: comment.id,
        },
        description: `${user.name} tipped M$ ${change} to ${comment.userName} for a comment`,
      })

      track('send comment tip', {
        contractId: comment.contractId,
        commentId: comment.id,
        amount: change,
        fromId: user.id,
        toId: comment.userId,
      })
    }, 1500)
  )
  // instant save on unrender
  useEffect(() => () => void saveTip.flush(), [saveTip])

  const changeTip = (tip: number) => {
    setLocalTip(tip)
    me && saveTip(me, tip - savedTip)
  }

  return (
    <Row className="items-center gap-2">
      {total > 0 && <span className="font-normal">{total}</span>}

      <button
        className="font-bold disabled:text-gray-300"
        disabled={
          !me ||
          me.id === comment.userId ||
          me.balance < localTip - savedTip + 5
        }
        onClick={() => changeTip(localTip + 5)}
      >
        Tip
      </button>
      {localTip > 0 && (
        <span className="text-primary font-semibold">(+{localTip})</span>
      )}
      {/* undo button */}
      {localTip > 0 && (
        <button className="text-red-500" onClick={() => changeTip(0)}>
          <XIcon className="w-4" />
        </button>
      )}
    </Row>
  )
}
