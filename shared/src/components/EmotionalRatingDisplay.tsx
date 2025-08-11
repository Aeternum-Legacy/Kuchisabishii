import React from 'react';
import { EmotionalRating } from '../types/index';
import { EmotionalMessages, EmotionalPalette } from '../constants/emotional-themes';

interface EmotionalRatingDisplayProps {
  rating: EmotionalRating;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const EmotionalRatingDisplay: React.FC<EmotionalRatingDisplayProps> = ({
  rating,
  showDescription = false,
  size = 'medium'
}) => {
  const getRatingColor = (rating: EmotionalRating): string => {
    switch (rating) {
      case EmotionalRating.MOUTH_LONELY:
        return EmotionalPalette.mouth_lonely;
      case EmotionalRating.CRAVING_WORTHY:
        return EmotionalPalette.craving_worthy;
      case EmotionalRating.OKAY:
        return EmotionalPalette.okay;
      case EmotionalRating.MEH:
        return EmotionalPalette.meh;
      case EmotionalRating.NEVER_AGAIN:
        return EmotionalPalette.never_again;
      default:
        return EmotionalPalette.meh;
    }
  };

  const getRatingMessage = (rating: EmotionalRating): string => {
    return EmotionalMessages.rating[rating] || 'Unknown rating';
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return { fontSize: '12px', padding: '4px 8px' };
      case 'large':
        return { fontSize: '18px', padding: '12px 16px' };
      default:
        return { fontSize: '14px', padding: '8px 12px' };
    }
  };

  const color = getRatingColor(rating);
  const message = getRatingMessage(rating);
  const sizeStyles = getSizeStyles(size);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: `${color}20`,
        borderRadius: '20px',
        border: `1px solid ${color}`,
        color: color,
        fontWeight: '600',
        ...sizeStyles
      }}
    >
      <div
        style={{
          width: size === 'small' ? '8px' : size === 'large' ? '12px' : '10px',
          height: size === 'small' ? '8px' : size === 'large' ? '12px' : '10px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '8px'
        }}
      />
      <span>{message}</span>
      {showDescription && (
        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
          {rating === EmotionalRating.MOUTH_LONELY && "Your food soulmate"}
          {rating === EmotionalRating.CRAVING_WORTHY && "You'll dream about this"}
          {rating === EmotionalRating.OKAY && "Pleasant, but not memorable"}
          {rating === EmotionalRating.MEH && "Forgettable, no spark"}
          {rating === EmotionalRating.NEVER_AGAIN && "Actively avoid this"}
        </div>
      )}
    </div>
  );
};