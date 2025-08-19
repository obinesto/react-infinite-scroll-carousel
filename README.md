# React Infinite Scroll Carousel

A React carousel component with infinite scroll functionality and automatic scrolling.

## Installation
 
```bash
npm install react-infinite-scroll-carousel
```

## Usage

```tsx
import 'react-infinite-scroll-carousel/dist/index.css';
import { Carousel } from 'react-infinite-scroll-carousel';

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

The component comes with a default stylesheet that you can import. You can override the default styles by passing your own class names to the containerClassName, itemClassName, and navigationButtonClassName props


## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | T[] | required | Array of items to display in the carousel |
| keyExtractor | (item: T, index: number) => string \| number | `index` | Function to extract a unique key for each item. |
| renderItem | (item: T, index: number) => ReactNode | required | Function to render each item |
| scrollInterval | number | 3000 | Time in milliseconds between auto-scrolls |
| scrollAmount | number | 300 | Number of pixels to scroll each time |
| itemClassName | string | "" | CSS classes for item containers |
| containerClassName | string | "" | CSS classes for the carousel container |
| navigationButtonClassName | string | "" | CSS classes for navigation buttons |
| loadMoreThreshold | number | 5 | The number of items remaining before loading more to create the infinite scroll effect. |

## License

MIT