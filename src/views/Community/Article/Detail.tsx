import { IArticle } from '@/vite-env'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { currentArticleState } from '@/recoil/store'
import { useRecoilState } from 'recoil'
import { useParams } from 'react-router-dom'
import {
  collectArticleApi,
  deleteCollectArticleApi,
  deleteLikeArticleApi,
  getArticleApi,
  getArticleCollectNumApi,
  getArticleCollectedApi,
  getArticleHotRankApi,
  getArticleLabelsApi,
  getArticleLikeNumApi,
  getArticleLikedApi,
  getArticleVisibleNumApi,
  likeArticleApi,
  setArticleVisibleApi
} from '@/api/article'
import { createArticleRemarkApi, getArticleRemarkListApi } from '@/api/remark'
import { getUserInfoApi } from '@/api/user'
import ReadOnly from '@/components/Editor/ReadOnly'
import style from './style.module.scss'
import { Button, Divider, Modal, Skeleton, Space } from 'antd'
import CommunityLabel from '@/components/Label/CommunityLabel/CommunityLabel'
import TextEditor from '@/components/Editor/TextEditor'
import RemarkCard from '@/components/Card/RemarkCard'

let visibled = false

const Detail: React.FC = () => {
  const { article_id } = useParams() as { article_id: string }
  const [currentArticle, setcurrentArticle] =
    useRecoilState(currentArticleState)
  const [openRemarkModal, setopenRemarkModal] = useState(false)
  const [remarkContent, setremarkContent] = useState('')

  useEffect(() => {
    return () => {
      setcurrentArticle(null)
    }
  }, [])

  useEffect(() => {
    console.log(currentArticle)
    !currentArticle?.liked && fetch()
    if (!visibled) {
      setArticleVisibleApi(article_id).then(res => console.log(res.data))
      visibled = true
    }
  }, [currentArticle])

  const fetch = useCallback(async () => {
    const res = await Promise.all([
      getArticleApi(article_id),
      getArticleLikedApi(article_id),
      getArticleLikeNumApi(article_id, 'true'),
      getArticleCollectedApi(article_id),
      getArticleCollectNumApi(article_id),
      getArticleVisibleNumApi(article_id),
      getArticleLabelsApi(article_id),
      getArticleRemarkListApi(article_id)
    ])
    const article: IArticle = res[0].data.data.article
    article.liked = res[1].data.data.like
    article.likeNum = res[2].data.data.total
    article.collected = res[3].data.data.collect
    article.collectNum = res[4].data.data.total
    article.visibleNum = res[5].data.data.total
    article.labels = res[6].data.data.articleLabels
    article.remark = {
      remarks: res[7].data.data.remarks,
      total: res[7].data.data.total
    }
    const userRes = await getUserInfoApi(article.user_id)
    article.user = userRes.data.data.user
    setcurrentArticle(article)
  }, [article_id])

  const handleLikeClick = useCallback(() => {
    const like = () => {
      likeArticleApi(article_id, 'true').then(async res => {
        console.log(res.data)
        if (res.data.code === 200 && currentArticle) {
          const { data } = await getArticleLikeNumApi(article_id, 'true')
          console.log(data)
          setcurrentArticle(value => {
            return {
              ...value,
              liked: 1,
              likeNum: data.data.total
            } as IArticle
          })
        }
      })
    }
    const cancelLike = () => {
      deleteLikeArticleApi(article_id).then(res => {
        console.log(res.data)
        if (res.data.code === 200 && currentArticle) {
          setcurrentArticle(value => {
            return {
              ...value,
              liked: 0
            } as IArticle
          })
        }
      })
    }
    currentArticle?.liked === 1 ? cancelLike() : like()
  }, [currentArticle])

  const handleCollectClick = useCallback(() => {
    const collect = () => {
      collectArticleApi(article_id).then(async res => {
        console.log(res.data)
        const { data } = await getArticleCollectNumApi(article_id)
        if (res.data.code === 200 && currentArticle) {
          const { data } = await getArticleCollectNumApi(article_id)
          setcurrentArticle(value => {
            return {
              ...value,
              collected: true,
              collectNum: data.data.total
            } as IArticle
          })
        }
      })
    }
    const cancelCollect = () => {
      deleteCollectArticleApi(article_id).then(async res => {
        console.log(res.data)
        if (res.data.code === 200 && currentArticle) {
          const { data } = await getArticleCollectNumApi(article_id)
          setcurrentArticle(value => {
            return {
              ...value,
              collected: false,
              collectNum: data.data.total
            } as IArticle
          })
        }
      })
    }
    currentArticle?.collected ? cancelCollect() : collect()
  }, [currentArticle])

  const handleSubmitRemarkClick = useCallback(() => {
    console.log(remarkContent)
    createArticleRemarkApi(
      article_id,
      JSON.stringify({
        content: remarkContent
      })
    ).then(async res => {
      if (res.data.code === 200) {
        setopenRemarkModal(false)
        setremarkContent('')
        const { data } = await getArticleRemarkListApi(article_id)
        setcurrentArticle(value => {
          return {
            ...value,
            remark: {
              remarks: data.data.remarks,
              total: data.data.total
            }
          } as IArticle
        })
      }
    })
  }, [article_id, remarkContent])

  const handleCommentClick = useCallback(() => {
    const a = document.createElement('a')
    a.href = '#remark'
    a.click()
  }, [])

  const handleArrowupClick = () => {
    const a = document.createElement('a')
    a.href = '#top'
    a.click()
  }
  return (
    <>
      {currentArticle && (
        <>
          <div id="top"></div>
          <div
            className="flex"
            style={{
              width: '1024px'
            }}
          >
            <div>
              <div
                style={{ width: '768px' }}
                className={`${style.responsiveMargin} h-full ml-16 shadow rounded px-16 py-8  transition-all duration-500 ease-in-out`}
              >
                {/* header */}
                <div>
                  <h1 className="mt-0">{currentArticle.title}</h1>
                  <Space size={'large'} className="text-sm text-slate-500">
                    <span>作者：{currentArticle.user?.name}</span>
                    <span>发布于：{currentArticle.created_at}</span>
                    <span>阅读：{currentArticle.visibleNum}</span>
                    <span></span>
                  </Space>

                  <Space>
                    {currentArticle.labels &&
                      currentArticle.labels.map((label, index) => (
                        <CommunityLabel
                          label={label}
                          key={index}
                        ></CommunityLabel>
                      ))}
                  </Space>
                </div>
                <Divider></Divider>
                {/* body */}
                <ReadOnly html={currentArticle.content}></ReadOnly>
              </div>
              {/* remark */}
              <div id="remark">
                <div className="flex justify-center">
                  <Button
                    type="dashed"
                    className="shadow m-4"
                    onClick={() => setopenRemarkModal(true)}
                  >
                    #我有一言
                  </Button>
                </div>
                <div>
                  {currentArticle.remark &&
                    currentArticle.remark.remarks.map(remark => (
                      <RemarkCard remark={remark} key={remark.id}></RemarkCard>
                    ))}
                </div>
              </div>
            </div>
            <div className="w-8"></div>
            <div className="w-64 h-96 shadow rounded "></div>
          </div>

          <div
            className={`${style.leftBar}w-12 h-12 px-4 fixed top-1/2 left-0 flex flex-col`}
            style={{
              translate: '0 -50%'
            }}
          >
            <Space direction="vertical" size={'large'}>
              <div className={style.item} onClick={handleLikeClick}>
                <div className={style.num}>{currentArticle.likeNum}</div>
                <svg className="icon">
                  <use
                    href={
                      currentArticle.liked === 1 ? '#icon-liked' : '#icon-like'
                    }
                  ></use>
                </svg>
              </div>
              <div className={style.item} onClick={handleCollectClick}>
                <div className={style.num}>{currentArticle.collectNum}</div>
                <svg className="icon">
                  <use
                    href={
                      currentArticle.collected
                        ? '#icon-collected'
                        : '#icon-collect'
                    }
                  ></use>
                </svg>
              </div>
              <div className={style.item} onClick={handleCommentClick}>
                <div className={style.num}>{currentArticle.remark?.total}</div>
                <svg className="icon">
                  <use href="#icon-comment"></use>
                </svg>
              </div>
              <div className={style.item} onClick={handleArrowupClick}>
                <svg className="icon">
                  <use href="#icon-arrowup"></use>
                </svg>
              </div>
            </Space>
          </div>
          <Modal
            open={openRemarkModal}
            onCancel={() => setopenRemarkModal(false)}
            footer={[
              <Button type="primary" onClick={handleSubmitRemarkClick}>
                发布
              </Button>
            ]}
            title={'我有一言'}
            style={{
              top: '50%',
              translate: '0 -50%'
            }}
          >
            <div>
              <TextEditor
                mode="markdown"
                value={remarkContent}
                htmlChange={(value: string) => setremarkContent(value)}
                placeholder=" "
                className="h-36"
              ></TextEditor>
            </div>
          </Modal>
        </>
      )}
    </>
  )
}

export default Detail