import React from "react";
import { Composition, Still } from "remotion";
import { Reel } from "./Reel";
import { Reel45, CROP_H } from "./Reel45";
import { Cover } from "./stills/Cover";
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
    <Composition
      id="RelaxBossReel45"
      component={Reel45}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={CROP_H}
    />
    <Still id="Cover" component={Cover} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
    <Still id="BlobLineup" component={BlobLineup} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
    <Still id="BlobCompare" component={BlobCompare} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} />
  </>
);
