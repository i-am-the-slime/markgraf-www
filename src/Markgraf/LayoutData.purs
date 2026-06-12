module Markgraf.LayoutData
  ( NodeJson
  , EdgeJson
  , TokenJson
  , LayoutJson
  , ScheduleJson
  , layoutJson
  , scheduleJson
  ) where

-- markgraf's layout pipeline (parse → animation → Sugiyama layout), reached
-- through a self-contained bundle of its compiled output. Pure and synchronous:
-- a source string in, plain node/edge geometry out (see Markgraf.Animation.
-- Layout.Export in the markgraf repo, where the Map→Array and Shape→Int
-- flattening lives so the logic stays in PureScript).

type NodeJson = { x :: Number, y :: Number, w :: Number, h :: Number, label :: String, shape :: Int }
type EdgeJson = { points :: Array { x :: Number, y :: Number } }
type TokenJson =
  { points :: Array { x :: Number, y :: Number }
  , label :: String
  , startT :: Number
  , endT :: Number
  , holdPre :: Number
  , holdPost :: Number
  }
type LayoutJson = { ok :: Boolean, error :: String, nodes :: Array NodeJson, edges :: Array EdgeJson }
type ScheduleJson =
  { ok :: Boolean
  , error :: String
  , duration :: Number
  , nodes :: Array NodeJson
  , edges :: Array EdgeJson
  , tokens :: Array TokenJson
  }

layoutJson :: String -> LayoutJson
layoutJson = layoutJsonImpl

foreign import layoutJsonImpl :: String -> LayoutJson

-- The full schedule: layout plus markgraf's precomputed token-flow timeline.
scheduleJson :: String -> ScheduleJson
scheduleJson = scheduleJsonImpl

foreign import scheduleJsonImpl :: String -> ScheduleJson
