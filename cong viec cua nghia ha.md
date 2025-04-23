1. Sửa các phần không tuân thủ secure coding practice. Ví dụ như trong file backend/routes/auth.js:
```js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});
```
nên được sử dụng .env, ngoài ra tạo thêm file .env.sample để dễ vận hành

2. Sửa lỗi phần error handling khi đăng nhập. Cụ thể:
```js
//backend/routes/auth.js
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
```
Đã có trả về Invalid credentials, tuy nhiên ở bên frontend:
```js
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form);
      setToken(res.data.token);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      // Add error handling here (e.g., show a snackbar or error message)
    }
  };
```
Chưa có logic xử lý báo lỗi cho người dùng
3. Database chưa được bảo mật: ở file docker-compose.yml:

  mongo:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
Việc truy cập vào database quá dễ dàng khiến cho website chưa được bảo mật giống phần 1, có thể sửa giống phần 1 bằng cách thêm vào .env file
 
4. Phần register.js quá đơn giản, chưa có css, thêm sao cho giống với login.js

5. Phần download của backend chưa thực sự tốt, chỉ tải được file cố định, thiết lập để nó có thể tự tải zip từ github về sử dụng github api