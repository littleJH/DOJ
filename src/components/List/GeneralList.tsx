import React from 'react'
import { List, Button, Popconfirm, Skeleton } from 'antd'
import { getPagination } from '@/config/config'

interface Iprops {
  loading: boolean
  dataSource: any
  itemRender: Function
  pageNum: number
  pageSize: number
  total: number
  onPageChange: Function
  onDelete?: Function
  onDetail?: Function
  onUpdate?: Function
  bordered?: boolean
}

const GeneralList: React.FC<Iprops> = (props) => {
  const { loading, dataSource, onDelete, onDetail, onUpdate, itemRender, bordered, pageNum, pageSize, total, onPageChange } = props

  const pagination = React.useMemo(() => getPagination('list', pageNum, pageSize, total, onPageChange), [pageNum, pageSize, total, onPageChange])

  const renderActions = (item: any, index: number) => {
    const actions: React.ReactNode[] = []
    onDetail &&
      actions.push(
        <Button
          type='link'
          style={{ padding: '0' }}
          onClick={() => onDetail(item, index)}
        >
          详情
        </Button>
      )
    onUpdate &&
      actions.push(
        <Button
          style={{ padding: '0' }}
          type='link'
          onClick={() => onUpdate(item, index)}
        >
          更新
        </Button>
      )
    onDelete &&
      actions.push(
        <Popconfirm
          title='确定删除该文章？'
          okText='确认'
          cancelText='取消'
          onConfirm={() => onDelete(item, index)}
        >
          <Button
            style={{ padding: '0' }}
            type='link'
            danger
          >
            删除
          </Button>
        </Popconfirm>
      )
    return actions
  }

  return (
    <>
      {loading && (
        <Skeleton
          style={{
            width: '100%'
          }}
          active
          paragraph={{
            rows: pageSize
          }}
        />
      )}
      <List
        bordered={bordered}
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        renderItem={(item, index) => (
          <List.Item
            key={JSON.stringify(item)}
            actions={renderActions(item, index)}
          >
            {itemRender(item)}
          </List.Item>
        )}
      ></List>
    </>
  )
}

export default GeneralList
