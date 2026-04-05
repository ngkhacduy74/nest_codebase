export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type phải là một trong các giá trị được định nghĩa
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Thêm tính năng mới
        'fix',      // Sửa lỗi
        'docs',     // Cập nhật tài liệu
        'style',    // Định dạng code (không ảnh hưởng logic)
        'refactor', // Tái cấu trúc code
        'test',     // Thêm hoặc sửa test
        'chore',    // Thay đổi không quan trọng (build, deps, etc.)
        'perf',     // Cải thiện performance
        'ci',       // Thay đổi CI/CD
        'build',    // Thay đổi build system
        'revert',   // Hoàn tác commit trước đó
      ],
    ],
    // Type không được để trống
    'type-empty': [2, 'never'],
    // Type phải viết thường
    'type-case': [2, 'always', 'lower-case'],
    // Scope không được để trống (nếu có)
    'scope-empty': [2, 'never'],
    // Scope phải viết thường
    'scope-case': [2, 'always', 'lower-case'],
    // Subject không được để trống
    'subject-empty': [2, 'never'],
    // Subject phải viết thường
    'subject-case': [2, 'always', 'lower-case'],
    // Subject không được kết thúc bằng dấu chấm
    'subject-full-stop': [2, 'never', '.'],
    // Subject không được vượt quá 72 ký tự
    'subject-max-length': [2, 'always', 72],
    // Header phải theo format type(scope): subject
    'header-max-length': [2, 'always', 72],
    // Body phải có dòng trống với header
    'body-leading-blank': [1, 'always'],
    // Footer phải có dòng trống với body/header
    'footer-leading-blank': [1, 'always'],
  },
};
