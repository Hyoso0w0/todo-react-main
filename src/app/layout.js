import "@/styles/globals.css";


export const metadata = {
  title: "Todo App",
  description: "Todo React App using Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}
      <img src="cat.jpg" alt="cat" /> 투두 쓰기 귀찮다. 그렇지만 쓰면 인생에 도움이 되는걸
      </body>
    </html>
  );
}

