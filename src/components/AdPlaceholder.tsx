import { useEffect } from 'react';

interface AdPlaceholderProps {
  size?: 'sidebar' | 'banner' | 'rectangle' | 'in-article' | 'multiplex';
  className?: string;
}

const AdPlaceholder = ({ size = 'sidebar', className = '' }: AdPlaceholderProps) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const getAdFormat = () => {
    switch (size) {
      case 'sidebar':
        return { format: 'vertical', width: 300, height: 250 };
      case 'banner':
        return { format: 'horizontal', width: 728, height: 90 };
      case 'rectangle':
        return { format: 'rectangle', width: 300, height: 250 };
      case 'in-article':
        return { format: 'fluid', layout: 'in-article' };
      case 'multiplex':
        return { format: 'autorelaxed', layout: 'in-article' };
      default:
        return { format: 'vertical', width: 300, height: 250 };
    }
  };

  const adFormat = getAdFormat();

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{
          display: 'block',
          ...(adFormat.layout !== 'in-article' && {
            width: `${adFormat.width}px`,
            height: `${adFormat.height}px`,
          }),
        }}
        data-ad-client="ca-pub-5579435188027085"
        data-ad-slot={size === 'sidebar' ? '1234567890' : size === 'banner' ? '0987654321' : '1122334455'}
        data-ad-format={adFormat.format}
        data-layout={adFormat.layout}
        data-full-width-responsive={size === 'in-article' || size === 'multiplex' ? 'true' : 'false'}
      ></ins>
    </div>
  );
};

export default AdPlaceholder;
