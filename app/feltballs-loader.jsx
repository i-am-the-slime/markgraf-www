"use client"

import dynamic from "next/dynamic"

const FeltballsOffscreen = dynamic(() => import("./feltballs-offscreen"), {
  ssr: false,
})

export default FeltballsOffscreen
