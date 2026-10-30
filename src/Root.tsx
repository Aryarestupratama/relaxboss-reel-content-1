import React from "react";
import { Composition, Still } from "remotion";
import { Reel } from "./Reel";
import { BlobLineup } from "./stills/BlobLineup";
import { BlobCompare } from "./stills/BlobCompare";
import { FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./theme";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RelaxBossReel"
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
    <Still id="BlobLineup" component={BlobLineup} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
    <Still id="BlobCompare" component={BlobCompare} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
  </>
);
