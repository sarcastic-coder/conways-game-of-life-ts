import { createTheme, style } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({});

export const styledPageContainer = style({
  display: 'flex',
  maxWidth: '100wv',
  maxHeight: '100vh',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
})

export const styledBoard = style({
  aspectRatio: 1,
});

export const styledBackgroundCell = style({
  stroke: 'white',
  fill: 'lightgrey',
  strokeWidth: 0.05,

  ':hover': {
    opacity: 0.8,
  },
});
