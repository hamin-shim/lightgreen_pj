# 배포 가이드 — GitHub Pages

간단히 `gh-pages`로 배포하는 방법입니다.

1. GitHub에 리포지토리 생성(예: `gdya`).
2. 로컬에서 커밋하고 푸시:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/gdya.git
git push -u origin main
```

3. GitHub Actions 워크플로우가 추가되어 있으면 `main` 브랜치 푸시 시 자동으로 `gh-pages` 브랜치에 배포됩니다.

4. 사이트 URL: `https://<your-username>.github.io/gdya/` (리포지토리 이름에 따라 다름)

5. QR 코드 생성: `qr.html`을 열어 위 URL을 입력하고 PNG를 다운로드하세요. 또는 다음과 같이 직접 링크로 생성할 수 있습니다:

```
qr.html?u=https://<your-username>.github.io/gdya/
```

6. 로컬 테스트(간단 서버):

```bash
python -m http.server 8000
# or
npx http-server .
```
