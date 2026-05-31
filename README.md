# 초록 돌봄방 — 로컬 실행 안내

간단한 정적 웹 앱입니다. 로컬에서 확인하려면 다음 중 하나를 사용하세요.

- 파일을 바로 열기: `index.html`을 브라우저로 열면 됩니다.
- 간단한 서버(권장): 프로젝트 루트에서 아래 명령어 실행

```
# Python 3
python -m http.server 8000

# or with node (if installed)
npx http-server -c-1 .
```

브라우저에서 `http://localhost:8000`으로 접속하세요. QR 코드는 이 URL을 가리키면 됩니다.

데이터는 브라우저 `localStorage`에 저장됩니다. 개발자 도구에서 `localStorage.clear()`로 초기화할 수 있습니다.
