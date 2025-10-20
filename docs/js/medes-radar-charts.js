/**
 * MedES Radar Charts for Medical Ethics LLM Leaderboard
 * MedES基准测试雷达图模块
 */

class MedESRadarChartManager {
    constructor() {
        this.charts = {};
        // Deterministic palette for models to ensure legend/series color consistency
        this.palette = [
            '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272',
            '#FC8452', '#9A60B4', '#EA7CCC', '#2F4554', '#61A0A8', '#D48265',
            '#C23531', '#91C7AE'
        ];
        this.modelNameToColor = {};
        this.nextColorIndex = 0;
    }

    /**
     * Initialize radar charts for MedES benchmark
     * 初始化MedES基准测试的雷达图
     */
    initMedESCharts() {
        // Combined MedES Radar Chart with all 6 indicators
        this.createRadarChart('medes-combined-radar', {
            title: 'MedES Benchmark Performance',
            indicators: [
                { name: 'Risk Rate', max: 0.3, inverse: false },
                { name: 'Quality', max: 1 },
                { name: 'Comprehension', max: 1 },
                { name: 'Ethics Knowledge', max: 70 },
                { name: 'Decision Support', max: 100 },
                { name: 'Ethics Conflict', max: 100 }
            ],
            dataKey: 'MedES Combined'
        });
    }

    /**
     * Create a radar chart
     * 创建雷达图
     */
    createRadarChart(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        if (typeof echarts === 'undefined') {
            console.error('ECharts is not loaded');
            return;
        }

        console.log(`Creating MedES radar chart for ${containerId}`);
        
        // Wait for container to be visible and have dimensions
        const initChart = () => {
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.log(`Container ${containerId} not ready, retrying...`);
                setTimeout(initChart, 100);
                return;
            }
            
            const chart = echarts.init(container);
            this.charts[containerId] = chart;

            // Default chart configuration
            const option = {
                title: {
                    text: config.title,
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#333333'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        return `${params.seriesName}<br/>${params.name}: ${params.value}`;
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle',
                    textStyle: {
                        fontSize: 12
                    }
                },
                radar: {
                    indicator: config.indicators,
                    shape: 'polygon',
                    splitNumber: 5,
                    radius: '60%',
                    center: ['50%', '50%'],
                    name: {
                        textStyle: {
                            color: '#333333',
                            fontSize: 12
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#e1e5e9'
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250, 250, 250, 0.1)', 'rgba(200, 200, 200, 0.1)']
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#e1e5e9'
                        }
                    }
                },
                series: []
            };

            chart.setOption(option);

            // Store config for later data updates
            chart._config = config;
            console.log(`MedES chart ${containerId} initialized successfully`);
        };
        
        // Start initialization
        initChart();
    }

    /**
     * Update radar chart with data
     * 使用数据更新雷达图
     */
    updateRadarChart(containerId, data) {
        const chart = this.charts[containerId];
        if (!chart || !chart._config) {
            console.warn(`Chart ${containerId} not found or not configured`);
            return;
        }

        const config = chart._config;
        const seriesData = this.prepareRadarData(data, config);

        console.log(`Updating MedES chart ${containerId} with ${seriesData.length} series`);

        // Derive a global color palette from series to keep legend in sync
        const palette = seriesData
            .map(s => (s.color || (s.lineStyle && s.lineStyle.color)))
            .filter(Boolean);

        const option = {
            series: seriesData
        };
        if (palette.length) {
            option.color = palette;
        }

        // Distribute legend items evenly to left and right
        const names = seriesData.map(s => s.name);
        const mid = Math.ceil(names.length / 2);
        const leftNames = names.slice(0, mid);
        const rightNames = names.slice(mid);
        option.legend = [
            {
                type: 'scroll',
                orient: 'vertical',
                left: '2%',
                top: 'middle',
                align: 'left',
                data: leftNames,
                textStyle: {
                    fontSize: 11
                }
            },
            {
                type: 'scroll',
                orient: 'vertical',
                right: '2%',
                top: 'middle',
                align: 'right',
                data: rightNames,
                textStyle: {
                    fontSize: 11
                }
            }
        ];

        chart.setOption(option);
    }

    /**
     * Prepare radar chart data
     * 准备雷达图数据
     */
    prepareRadarData(data, config) {
        if (!data || !Array.isArray(data)) {
            console.warn('No MedES data provided or data is not an array');
            return [];
        }

        console.log(`Preparing MedES radar data for ${data.length} models`);

        const series = [];
        const modelGroups = this.groupModelsByType(data);

        Object.keys(modelGroups).forEach(type => {
            const models = modelGroups[type];

            console.log(`Processing ${models.length} MedES models of type ${type}`);

            models.forEach((model, index) => {
                const values = this.extractRadarValues(model, config);
                console.log(`MedES Model ${model.Model}: values =`, values);
                
                if (values && values.length > 0) {
                    const seriesColor = this.getSeriesColorForModel(model.Model);
                    series.push({
                        name: model.Model,
                        type: 'radar',
                        color: seriesColor,
                        lineStyle: {
                            color: seriesColor,
                            width: 3
                        },
                        areaStyle: {
                            color: seriesColor,
                            opacity: 0.15
                        },
                        symbol: 'circle',
                        symbolSize: 4,
                        data: [{
                            value: values,
                            name: model.Model
                        }]
                    });
                }
            });
        });

        console.log(`Generated ${series.length} series for MedES radar chart`);
        return series;
    }

    /**
     * Group models by type
     * 按类型分组模型
     */
    groupModelsByType(data) {
        const groups = {};
        data.forEach(model => {
            const type = model.Type || 'General-purpose';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(model);
        });
        return groups;
    }

    /**
     * Extract radar values from model data
     * 从模型数据中提取雷达图数值
     */
    extractRadarValues(model, config) {
        const values = [];
        
        config.indicators.forEach(indicator => {
            let value = 0;
            const indicatorName = indicator.name.toLowerCase().replace(/\s+/g, '');
            
            // Map indicator names to model properties
            const propertyMap = this.getPropertyMap(config.dataKey);
            const property = propertyMap[indicatorName];
            
            console.log(`Extracting ${indicator.name}: indicatorName=${indicatorName}, property=${property}, model[property]=${model[property]}, max=${indicator.max}`);
            
            if (property && model[property] !== undefined) {
                value = model[property];
                console.log(`Raw value for ${indicator.name}: ${value}`);
                
                // Handle inverse indicators (like Risk Rate where lower is better)
                if (indicator.inverse) {
                    value = indicator.max - value;
                    console.log(`After inverse for ${indicator.name}: ${value}`);
                }
                
                // Don't normalize - let ECharts handle the display based on indicator.max
                console.log(`Final value for ${indicator.name}: ${value}`);
            }
            
            values.push(value);
        });

        return values;
    }

    /**
     * Get property mapping for different data types
     * 获取不同数据类型的属性映射
     */
    getPropertyMap(dataKey) {
        const mappings = {
            'MedES Combined': {
                'riskrate': 'RiskRate',
                'quality': 'QualityScore',
                'comprehension': 'ComprehensiveScore',
                'ethicsknowledge': 'EKAcc',
                'decisionsupport': 'DSAcc',
                'ethicsconflict': 'ECAcc'
            }
        };

        return mappings[dataKey] || {};
    }

    /**
     * Get series color for model
     * 获取模型的系列颜色
     */
    getSeriesColorForModel(modelName) {
        if (!this.modelNameToColor[modelName]) {
            const color = this.palette[this.nextColorIndex % this.palette.length];
            this.modelNameToColor[modelName] = color;
            this.nextColorIndex += 1;
        }
        return this.modelNameToColor[modelName];
    }

    /**
     * Update all MedES charts
     * 更新所有MedES图表
     */
    updateMedESCharts(medesData) {
        // Combine subjective and objective data for the radar chart
        const combinedData = this.combineMedESData(medesData);
        if (combinedData.length > 0) {
            this.updateRadarChart('medes-combined-radar', combinedData);
        }
    }

    /**
     * Combine MedES subjective and objective data
     * 合并MedES主观和客观数据
     */
    combineMedESData(medesData) {
        const subjectiveData = medesData['Subjective Ethical Reasoning'] || [];
        const objectiveData = medesData['Objective Tasks'] || [];
        
        console.log('Combining MedES data:', {
            subjective: subjectiveData.length,
            objective: objectiveData.length
        });
        
        // Create maps for both datasets
        const subjectiveMap = {};
        subjectiveData.forEach(item => {
            subjectiveMap[item.Model] = item;
        });
        
        const objectiveMap = {};
        objectiveData.forEach(item => {
            objectiveMap[item.Model] = item;
        });
        
        // Get all unique model names
        const allModels = new Set([
            ...subjectiveData.map(item => item.Model),
            ...objectiveData.map(item => item.Model)
        ]);
        
        console.log('All MedES models:', Array.from(allModels));
        
        // Combine data for all models
        const combinedData = [];
        allModels.forEach(modelName => {
            const subjectiveItem = subjectiveMap[modelName];
            const objectiveItem = objectiveMap[modelName];
            
            // Use default values for missing data
            const combinedItem = {
                Model: modelName,
                Type: subjectiveItem?.Type || objectiveItem?.Type || 'General-purpose',
                // Subjective metrics (use 0 as default if missing)
                RiskRate: subjectiveItem?.RiskRate !== undefined ? subjectiveItem.RiskRate : 0,
                QualityScore: subjectiveItem?.QualityScore !== undefined ? subjectiveItem.QualityScore : 0,
                ComprehensiveScore: subjectiveItem?.ComprehensiveScore !== undefined ? subjectiveItem.ComprehensiveScore : 0,
                // Objective metrics (use 0 as default if missing)
                EKAcc: objectiveItem?.EKAcc !== undefined ? objectiveItem.EKAcc : 0,
                DSAcc: objectiveItem?.DSAcc !== undefined ? objectiveItem.DSAcc : 0,
                ECAcc: objectiveItem?.ECAcc !== undefined ? objectiveItem.ECAcc : 0
            };
            
            console.log(`Combined MedES data for ${modelName}:`, combinedItem);
            combinedData.push(combinedItem);
        });
        
        console.log('Final MedES combined data:', combinedData);
        return combinedData;
    }

    /**
     * Resize all charts
     * 调整所有图表大小
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    /**
     * Destroy all charts
     * 销毁所有图表
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.dispose) {
                chart.dispose();
            }
        });
        this.charts = {};
    }
}

// Global MedES radar chart manager instance
window.medesRadarChartManager = new MedESRadarChartManager();

// Auto-resize charts on window resize
window.addEventListener('resize', () => {
    if (window.medesRadarChartManager) {
        window.medesRadarChartManager.resizeCharts();
    }
});
