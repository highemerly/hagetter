import React from 'react'
import { observer } from 'mobx-react-lite'
import {
  useStore,
  useTimeline,
  useSearchTimeline,
  useUrlSearchTimeline,
  useEditor,
} from '../../stores'

import Toot, { isPublic } from '../Toot/Toot'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import HomeIcon from '@material-ui/icons/HomeRounded'
import PeopleIcon from '@material-ui/icons/PeopleRounded'
import PublicIcon from '@material-ui/icons/PublicRounded'
import SearchIcon from '@material-ui/icons/SearchRounded'
import StarIcon from '@material-ui/icons/StarRounded'
import LinkIcon from '@material-ui/icons/LinkRounded'

import LinearProgress from '@material-ui/core/LinearProgress'

import {
  PullToRefresh,
  ReleaseContent,
  RefreshContent,
  PullDownContent,
} from 'react-js-pull-to-refresh'

import { makeStyles, createStyles } from '@material-ui/core/styles'

import { Status } from '../../utils/mastodon/types'
import HowTo, { Tips } from './HowTo'

const useStyles = makeStyles((theme) =>
  createStyles({
    gridColumn: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },
    gridContent: {
      position: 'relative',
      flexGrow: 1,
      boxSizing: 'border-box',
      marginTop: 5,
      marginBottom: 2, // TODO: 微調整(消したい)
      height: '100%',
      backgroundColor: 'white',
    },
    searchArea: {
      marginTop: 5,
    },
    tootSelector: {
      flexGrow: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      overflow: 'scroll',
      '-webkit-overflow-scrolling': 'touch',
      border: '1px solid #ccc',
      borderRadius: 5,
      boxSizing: 'border-box',
    },
    selectorButtom: {
      textAlign: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 30,
    },
    menu: {
      border: '1px solid #ccc',
    },
    howToContainer: {
      border: '1px solid #ccc',
      borderRadius: 5,
      boxSizing: 'border-box',
      backgroundColor: '#fff',
      flexGrow: 1,
      marginTop: 5,
      marginBottom: 2,
    },
    howTo: {
      margin: theme.spacing(3),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      backgroundColor: '#f1f1f1',
    },
    howToText: {
      width: '100%',
      textAlign: 'center',
    },
    progress: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 2,
    },
    toot: {
      borderBottom: '1px solid #ccc',
    },
  })
)

const HowT: React.FC = () => {
  const classes = useStyles({})

  return (
    <div className={classes.howToContainer}>
      <div className={classes.howTo}>
        <p className={classes.howToText}>使い方</p>
        <ul>
          <li>タイムラインからまとめるやつを探しましょう</li>
          <li>クリックで右に追加されます</li>
          <li>まとめには大きな責任が伴います</li>
        </ul>
      </div>
    </div>
  )
}

const Timeline: React.FC<{ name: string }> = observer(({ name }) => {
  const store = useTimeline(name)
  const editor = useEditor()
  const classes = useStyles({})
  React.useEffect(() => {
    if (store.init) {
      store.reload().catch(console.error)
    }
  }, [])

  const onStatusSelect = (status: Status) => {
    editor.addStatus(status, editor.getAnchor())
    return false
  }

  const onChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    store.setFilter(event.target.value)
  }

  const onRefresh = async () => {
    try {
      await store.reload()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className={classes.searchArea}>
        <TextField
          id="filter-input"
          label={'フィルタ'}
          variant="outlined"
          onChange={onChangeFilter}
          fullWidth
          style={{ backgroundColor: 'white' }}
        />
      </div>
      <div className={classes.gridContent}>
        {store.loading && <LinearProgress className={classes.progress} />}
        <div className={classes.tootSelector}>
          <PullToRefresh
            pullDownContent={<PullDownContent label="リロード" />}
            releaseContent={<ReleaseContent />}
            refreshContent={<RefreshContent height="100" />}
            pullDownThreshold={100}
            onRefresh={onRefresh}
            triggerHeight={50}
            backgroundColor="white"
          >
            <div id="basic-container">
              {store.filteredStatuses.map((status) => (
                <Toot
                  onClick={onStatusSelect}
                  key={status.id}
                  status={status}
                  disabled={!isPublic(status.visibility)}
                  className={classes.toot}
                />
              ))}
              {!store.init &&
              !store.loading &&
              store.type !== 'favourites' && ( // favはmax_idをlinkヘッダから取得しないといけないので未対応
                  <div className={classes.selectorButtom}>
                    <button onClick={() => store.loadMore()}>
                      もっと読み込む
                    </button>
                  </div>
                )}
            </div>
          </PullToRefresh>
        </div>
      </div>
    </>
  )
})

const SearchTimeline: React.FC = observer(() => {
  const store = useSearchTimeline()
  const editor = useEditor()

  const classes = useStyles({})
  const [keyword, setKeyword] = React.useState('')
  const onSearch = async (keyword: string) => {
    await store.search(keyword)
    //for await (const it of store.search(keyword)) { console.log('it') }
  }
  const onStatusSelect = (status: Status) => {
    editor.addStatus(status, editor.getAnchor())
    return false
  }

  const onChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    store.setFilter(event.target.value)
  }

  const onRefresh = async () => {}

  return (
    <>
      <div className="queryArea">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(keyword)
            return false
          }}
        >
          <TextField
            id="filter-input"
            label={'検索'}
            variant="outlined"
            onChange={(event) => setKeyword(event.target.value)}
            fullWidth
            style={{ backgroundColor: 'white', marginTop: 5 }}
          />
        </form>
      </div>
      <div className="searchArea">
        <TextField
          id="filter-input"
          label={'フィルタ'}
          variant="outlined"
          onChange={onChangeFilter}
          fullWidth
          style={{ backgroundColor: 'white' }}
        />
      </div>
      <div className={classes.gridContent}>
        {store.loading && <LinearProgress className={classes.progress} />}
        <div className={classes.tootSelector}>
          <PullToRefresh
            pullDownContent={<PullDownContent label="リロード" />}
            releaseContent={<ReleaseContent />}
            refreshContent={<RefreshContent height="100" />}
            pullDownThreshold={100}
            onRefresh={onRefresh}
            triggerHeight={50}
            backgroundColor="white"
          >
            <div id="basic-container">
              {store.filteredStatuses.map((status) => (
                <Toot
                  onClick={onStatusSelect}
                  key={status.id}
                  status={status}
                  disabled={!isPublic(status.visibility)}
                  className={classes.toot}
                />
              ))}
            </div>
          </PullToRefresh>
        </div>
      </div>
    </>
  )
})

const UrlSearchTimeline: React.FC = observer(() => {
  const store = useUrlSearchTimeline()
  const editor = useEditor()
  const app = useStore()

  const classes = useStyles({})
  const [keyword, setKeyword] = React.useState('')

  const onStatusSelect = (status: Status) => {
    editor.addStatus(status, editor.getAnchor())
    return false
  }

  const onSearch = async (keyword: string) => {
    try {
      await store.search(keyword)
    } catch (err) {
      console.error(err)
      app.notifyError(err)
    }
    //for await (const it of store.search(keyword)) { console.log('it') }
  }

  return (
    <>
      <div className="queryArea">
        <TextField
          id="filter-input"
          label={'URL'}
          variant="outlined"
          onChange={(event) => setKeyword(event.target.value)}
          fullWidth
          multiline
          rows={2}
          style={{ backgroundColor: 'white', marginTop: 5 }}
        />
        <Button
          variant="contained"
          color="primary"
          style={{ float: 'right' }}
          onClick={() => onSearch(keyword)}
        >
          検索
        </Button>
      </div>
      <div className={classes.gridContent}>
        {store.loading && <LinearProgress className={classes.progress} />}
        <div className={classes.tootSelector}>
          <div id="basic-container">
            {store.statuses.map((status) => (
              <Toot
                onClick={onStatusSelect}
                key={status.id}
                status={status}
                disabled={!isPublic(status.visibility)}
                className={classes.toot}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
})

const StatusSelector: React.FC = observer(() => {
  const classes = useStyles({})
  const store = useStore()

  const [viewType, setViewType] = React.useState<number | false>(false)

  const onChangeType = React.useCallback(
    async (event: React.ChangeEvent<{}>, newValue: number) => {
      setViewType(newValue)
    },
    []
  )

  return (
    <>
      <Paper elevation={0} className={classes.menu}>
        <Tabs
          value={viewType}
          onChange={onChangeType}
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon tabs example"
          variant="fullWidth"
        >
          <Tab style={{ minWidth: 50 }} icon={<HomeIcon />} aria-label="home" />
          <Tab
            style={{ minWidth: 50 }}
            icon={<PeopleIcon />}
            aria-label="local"
          />
          <Tab
            style={{ minWidth: 50 }}
            icon={<PublicIcon />}
            aria-label="public"
          />
          <Tab
            style={{ minWidth: 50 }}
            icon={<StarIcon />}
            aria-label="favourites"
          />
          <Tab
            style={{ minWidth: 50 }}
            icon={<SearchIcon />}
            aria-label="search"
          />
          <Tab style={{ minWidth: 50 }} icon={<LinkIcon />} aria-label="url" />
        </Tabs>
      </Paper>
      {viewType === false && <HowT />}
      {viewType === 0 && <Timeline name="home" />}
      {viewType === 1 && <Timeline name="local" />}
      {viewType === 2 && <Timeline name="public" />}
      {viewType === 3 && <Timeline name="favourites" />}
      {viewType === 4 && <SearchTimeline />}
      {viewType === 5 && <UrlSearchTimeline />}
    </>
  )
})

export default StatusSelector
