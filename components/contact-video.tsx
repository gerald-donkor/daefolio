'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMotionPreference } from './motion-provider';
import styles from './contact-video.module.css';

export function ContactVideo() {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { paused } = useMotionPreference();

  useEffect(() => {
    const element = video.current;
    const backdrop = container.current;
    if (!element || !backdrop) return;
    if (paused) {
      element.pause();
      return;
    }

    let visible = false;
    const syncPlayback = () => {
      if (visible && !document.hidden && element.hasAttribute('src')) {
        // Autoplay can be denied by device policy; the still remains visible.
        void element.play().catch(() => {});
      } else {
        element.pause();
      }
    };
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!element.hasAttribute('src')) {
        element.src = '/videos/contact-interface.mp4';
        element.load();
      }
      syncPlayback();
      preloadObserver.disconnect();
    }, { rootMargin: '300px' });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });

    preloadObserver.observe(backdrop);
    playbackObserver.observe(backdrop);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      element.pause();
    };
  }, [paused]);

  return <div ref={container} className={styles.backdrop} aria-hidden="true">
    <Image src="/videos/contact-interface-poster.webp" alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 65vw" className={styles.media} />
    <video
      ref={video}
      className={`${styles.media} ${styles.video}`}
      data-playing={playing}
      width={1080}
      height={1920}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      onError={() => setPlaying(false)}
    />
  </div>;
}
