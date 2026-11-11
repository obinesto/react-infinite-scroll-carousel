# React Infinite Scroll Carousel

A React carousel component with infinite scroll functionality and automatic scrolling.

## Installation
 
```bash
npm install @obinesto/react-infinite-scroll-carousel
```

## Usage

```tsx
import '@obinesto/react-infinite-scroll-carousel/dist/index.css';
import { Carousel } from '@obinesto/react-infinite-scroll-carousel';

interface MyItem {
  title: string;
  content: string;
}

const items: MyItem[] = [
  { title: 'Item 1', content: 'Content 1' },
  { title: 'Item 2', content: 'Content 2' },
  // ...more items
];

function MyComponent() {
  return (
    <Carousel
      items={items}
      renderItem={(item) => (
        <div>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </div>
      )}
      itemClassName="w-64 p-4 bg-white shadow-md"
      scrollInterval={3000}
      scrollAmount={300}
    />
  );
}
```

## Styling

Import the default stylesheet as shown above.
Use `containerClassName`, `itemClassName`, and `navigationButtonClassName` to add custom styles.
Apply item widths through `itemClassName`.


## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | T[] | required | Array of items to display in the carousel |
| keyExtractor | (item: T, index: number) => string \| number | `index` | Function to extract a unique key for each item. |
| renderItem | (item: T, index: number) => ReactNode | required | Function to render each item |
| scrollInterval | number | 3000 | Time in milliseconds between automatic scrolls. Set to zero to disable. |
| scrollAmount | number | 300 | Number of pixels to scroll each time |
| itemClassName | string | "" | CSS classes for item containers |
| containerClassName | string | "" | CSS classes for the carousel container |
| navigationButtonClassName | string | "" | CSS classes for navigation buttons |
| loadMoreThreshold | number | — | Deprecated. Accepted for compatibility. The viewport width now determines the copy count. |

## Scrolling behavior

The carousel scrolls continuously in both directions.
Use the navigation buttons or scroll manually to move through items.
Set `scrollInterval={0}` to disable automatic scrolling.
Steps longer than one full loop use an equivalent shorter distance.
Changes to `items` appear on the next render.
`renderItem` and `keyExtractor` receive the index within the source array for each copy.
Keys must be unique within the source array.
Empty carousels disable navigation and automatic scrolling.
Import the stylesheet before use.

## License

MIT
