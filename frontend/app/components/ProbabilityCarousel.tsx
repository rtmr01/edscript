import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ProbabilityCarouselProps {
  children: React.ReactNode[];
}

export function ProbabilityCarousel({ children }: ProbabilityCarouselProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true
  };

  if (!isMobile) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
  }

  return (
    <div className="probability-carousel">
      <Slider {...settings}>{children}</Slider>
    </div>
  );
}
