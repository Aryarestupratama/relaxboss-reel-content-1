import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png"); // png agar keluaran yuv420p (bukan yuvj420p)
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709"); // warna pastel konsisten di Instagram dan browser
