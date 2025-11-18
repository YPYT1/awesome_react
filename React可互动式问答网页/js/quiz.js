// 答题系统核心逻辑
class QuizSystem {
    constructor(questions, stageName) {
        this.questions = questions;
        this.stageName = stageName;
        this.currentIndex = 0;
        this.answers = [];
        this.correctCount = 0;
        this.init();
    }

    init() {
        this.renderQuestion();
        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderQuestion() {
        const question = this.questions[this.currentIndex];
        const container = document.getElementById('question-container');
        
        if (this.currentIndex >= this.questions.length) {
            this.showCompletion();
            return;
        }

        container.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="question-number">第 ${this.currentIndex + 1} 题</span>
                        <span class="question-type">${this.getTypeText(question.type)}</span>
                    </div>
                    <div class="question-tags">
                        ${question.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <p class="question-text">${this.escapeHtml(question.question)}</p>
                </div>

                <ul class="options-list" id="options-list">
                    ${question.options.map((option, index) => `
                        <li class="option-item" data-index="${index}">
                            <span class="option-label">${this.getOptionLabel(index)}</span>
                            <span class="option-text">${this.escapeHtml(option)}</span>
                        </li>
                    `).join('')}
                </ul>

                <div id="feedback-area"></div>

                <div class="navigation-buttons">
                    <button class="nav-button next-button" id="next-button" disabled>
                        ${this.currentIndex === this.questions.length - 1 ? '查看结果' : '下一题'} →
                    </button>
                </div>
            </div>
        `;

        this.attachOptionListeners();
    }

    getTypeText(type) {
        const typeMap = {
            'single': '单选题',
            'multiple': '多选题',
            'judge': '判断题'
        };
        return typeMap[type] || '未知';
    }

    getOptionLabel(index) {
        return String.fromCharCode(65 + index);
    }

    attachOptionListeners() {
        const question = this.questions[this.currentIndex];
        const optionsList = document.getElementById('options-list');
        const nextButton = document.getElementById('next-button');
        const options = optionsList.querySelectorAll('.option-item');
        let selectedIndices = [];
        let answered = false;

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (answered) return;

                const index = parseInt(option.dataset.index);

                if (question.type === 'multiple') {
                    // 多选题
                    if (selectedIndices.includes(index)) {
                        selectedIndices = selectedIndices.filter(i => i !== index);
                        option.classList.remove('selected');
                    } else {
                        selectedIndices.push(index);
                        option.classList.add('selected');
                    }
                } else {
                    // 单选题和判断题
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedIndices = [index];
                }

                nextButton.disabled = selectedIndices.length === 0;

                // 如果不是多选题，选择后自动显示结果
                if (question.type !== 'multiple') {
                    this.checkAnswer(selectedIndices, options);
                    answered = true;
                } else {
                    // 多选题需要手动确认
                    if (!answered) {
                        nextButton.onclick = () => {
                            if (!answered) {
                                this.checkAnswer(selectedIndices, options);
                                answered = true;
                                nextButton.onclick = () => this.nextQuestion();
                                nextButton.textContent = this.currentIndex === this.questions.length - 1 ? '查看结果 →' : '下一题 →';
                            }
                        };
                    }
                }
            });
        });

        // 单选题和判断题的下一题按钮
        if (question.type !== 'multiple') {
            nextButton.onclick = () => this.nextQuestion();
        }
    }

    checkAnswer(selectedIndices, options) {
        const question = this.questions[this.currentIndex];
        const correctAnswers = question.answer;
        
        // 判断答案是否正确
        let isCorrect = false;
        if (question.type === 'multiple') {
            const sortedSelected = [...selectedIndices].sort();
            const sortedCorrect = [...correctAnswers].sort();
            isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        } else {
            isCorrect = selectedIndices[0] === correctAnswers[0];
        }

        // 记录答案
        this.answers.push({
            questionIndex: this.currentIndex,
            selected: selectedIndices,
            correct: isCorrect
        });

        if (isCorrect) {
            this.correctCount++;
        }

        // 显示结果反馈
        this.showFeedback(isCorrect, question, selectedIndices, options);
        
        // 禁用所有选项
        options.forEach(opt => opt.classList.add('disabled'));
        
        // 更新统计
        this.updateStats();
    }

    showFeedback(isCorrect, question, selectedIndices, options) {
        const feedbackArea = document.getElementById('feedback-area');
        
        // 标记选项
        options.forEach((option, index) => {
            if (question.answer.includes(index)) {
                option.classList.add('correct');
            } else if (selectedIndices.includes(index)) {
                option.classList.add('incorrect');
            }
        });

        // 显示反馈和解析
        feedbackArea.innerHTML = `
            <div class="result-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-icon">${isCorrect ? '✅' : '❌'}</div>
                <div class="result-text">${isCorrect ? '回答正确！' : '回答错误'}</div>
            </div>

            <div class="explanation-section">
                <button class="explanation-toggle active" onclick="this.classList.toggle('active'); this.nextElementSibling.classList.toggle('show')">
                    <span>📖 详细解析</span>
                    <span class="arrow">▼</span>
                </button>
                <div class="explanation-content show">
                    <div class="explanation-inner">
                        ${this.renderExplanation(question, selectedIndices)}
                    </div>
                </div>
            </div>
        `;
    }

    renderExplanation(question, selectedIndices) {
        let html = '';

        // 正确答案解析
        html += `
            <div class="explanation-item">
                <div class="explanation-title correct-exp">
                    ✅ 正确答案: ${question.answer.map(i => this.getOptionLabel(i)).join(', ')}
                </div>
                <div class="explanation-text">${this.escapeHtml(question.explanation.correct)}</div>
            </div>
        `;

        // 错误选项解析
        if (question.explanation.wrong && Object.keys(question.explanation.wrong).length > 0) {
            const wrongOptions = Object.entries(question.explanation.wrong);
            wrongOptions.forEach(([optionIndex, explanation]) => {
                const index = parseInt(optionIndex);
                const wasSelected = selectedIndices.includes(index);
                html += `
                    <div class="explanation-item">
                        <div class="explanation-title incorrect-exp">
                            ${wasSelected ? '⚠️' : 'ℹ️'} 选项 ${this.getOptionLabel(index)} ${wasSelected ? '(您选择了此项)' : ''}
                        </div>
                        <div class="explanation-text">${this.escapeHtml(explanation)}</div>
                    </div>
                `;
            });
        }

        return html;
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.renderQuestion();
            this.updateStats();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.showCompletion();
        }
    }

    updateStats() {
        document.getElementById('answered-count').textContent = this.answers.length;
        document.getElementById('total-count').textContent = this.questions.length;
        
        const accuracy = this.answers.length > 0 
            ? Math.round((this.correctCount / this.answers.length) * 100) 
            : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    showCompletion() {
        const container = document.getElementById('question-container');
        const accuracy = Math.round((this.correctCount / this.questions.length) * 100);
        
        let message = '';
        let icon = '';
        if (accuracy >= 90) {
            message = '优秀！你对这部分内容掌握得非常好！';
            icon = '🎉';
        } else if (accuracy >= 70) {
            message = '不错！继续加油，你可以做得更好！';
            icon = '👍';
        } else if (accuracy >= 60) {
            message = '及格了！建议复习相关知识点。';
            icon = '💪';
        } else {
            message = '需要加强！建议重新学习这部分内容。';
            icon = '📚';
        }

        container.innerHTML = `
            <div class="completion-card">
                <div class="completion-icon">${icon}</div>
                <h2 class="completion-title">恭喜完成！</h2>
                <p style="color: #718096; font-size: 16px; margin-bottom: 20px;">${message}</p>
                
                <div class="completion-stats">
                    <div class="completion-stat">
                        <div class="completion-stat-value">${this.correctCount}</div>
                        <div class="completion-stat-label">答对题数</div>
                    </div>
                    <div class="completion-stat">
                        <div class="completion-stat-value">${this.questions.length}</div>
                        <div class="completion-stat-label">总题数</div>
                    </div>
                    <div class="completion-stat">
                        <div class="completion-stat-value">${accuracy}%</div>
                        <div class="completion-stat-label">正确率</div>
                    </div>
                </div>

                <div class="completion-buttons">
                    <a href="../index.html" class="completion-button primary-button">返回首页</a>
                    <a href="javascript:location.reload()" class="completion-button secondary-button">重新答题</a>
                </div>
            </div>
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 初始化函数
function initQuiz(questions, stageName) {
    document.body.classList.add('quiz-page');
    new QuizSystem(questions, stageName);
}

