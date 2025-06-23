export function FooterLayout() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {currentYear} Pickle. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              다양한 종류의 랜덤 뽑기 서비스
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
