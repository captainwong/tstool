# tstool

将 `Qt 翻译文件 *.ts` 翻译为其他语言的小工具，要求源代码内都是 `tr("some english text")`，不支持 `tr("中文文本")`，且已经做好了中文的翻译即已经有 `zh_CN.ts`。

基于百度翻译，将条目以中文翻译为目标语言。

## 支持的目标语言

```js
const dst_langs = {
    'zh_TW': 'cht', // 繁体中文
    'ar': 'ara',    // 阿拉伯语
    'de': 'de',     // 德语
    'es': 'spa',    // 西班牙语
    'fr': 'fra',    // 法语
    'it': 'it',     // 意大利语
    'pt': 'pt',     // 葡萄牙语
    'ru': 'ru',     // 俄语
};
```

## 用法
`node index.js -z 中文ts文件 -d 目标语言列表`

## 示例

```bash
export BAIDU_APP_ID=你的百度翻译appid
export BAIDU_APP_SECRET=你的百度翻译app_secret
# 根据 helloworld_zh_cn.ts 内的中文翻译，翻译为 helloworld_zh_TW.ts 和 helloworld_fr.ts
node index.js -z ../helloworld_zh_cn.ts -d zh_TW fr
```

## Known Issues

* `-d dst` 参数过多或语言文件太大时，有可能出现以下错误：
    ```bash
    <--- Last few GCs --->

    [524513:0x5fb2290]  2012454 ms: Mark-sweep (reduce) 2021.8 (2091.2) -> 2019.7 (2092.9) MB, 1023.9 / 0.1 ms  (+ 1501.1 ms in 1561 steps since start of marking, biggest step 8.9 ms, walltime since start of marking 2556 ms) (average mu = 0.622, current mu = [524513:0x5fb2290]  2015676 ms: Mark-sweep 2020.7 (2064.9) -> 2019.7 (2064.9) MB, 3212.9 / 0.0 ms  (average mu = 0.424, current mu = 0.003) allocation failure scavenge might not succeed


    <--- JS stacktrace --->

    FATAL ERROR: MarkCompactCollector: young object promotion failed Allocation failed - JavaScript heap out of memory
    1: 0xa04200 node::Abort() [node]
    2: 0x94e4e9 node::FatalError(char const*, char const*) [node]
    3: 0xb797be v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
    4: 0xb79b37 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]
    5: 0xd343c5  [node]
    6: 0xd64f5e v8::internal::EvacuateNewSpaceVisitor::Visit(v8::internal::HeapObject, int) [node]
    7: 0xd70f96 v8::internal::FullEvacuator::RawEvacuatePage(v8::internal::MemoryChunk*, long*) [node]
    8: 0xd5d17f v8::internal::Evacuator::EvacuatePage(v8::internal::MemoryChunk*) [node]
    9: 0xd5d3f8 v8::internal::PageEvacuationTask::RunInParallel(v8::internal::ItemParallelJob::Task::Runner) [node]
    10: 0xd4fcd9 v8::internal::ItemParallelJob::Run() [node]
    11: 0xd72ef0 void v8::internal::MarkCompactCollectorBase::CreateAndExecuteEvacuationTasks<v8::internal::FullEvacuator, v8::internal::MarkCompactCollector>(v8::internal::MarkCompactCollector*, v8::internal::ItemParallelJob*, v8::internal::MigrationObserver*, long) [node]
    12: 0xd7378c v8::internal::MarkCompactCollector::EvacuatePagesInParallel() [node]
    13: 0xd73955 v8::internal::MarkCompactCollector::Evacuate() [node]
    14: 0xd85941 v8::internal::MarkCompactCollector::CollectGarbage() [node]
    15: 0xd41c68 v8::internal::Heap::MarkCompact() [node]
    16: 0xd43758 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [node]
    17: 0xd46b9c v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node]
    18: 0xd0c4a2 v8::internal::Factory::AllocateRaw(int, v8::internal::AllocationType, v8::internal::AllocationAlignment) [node]
    19: 0xd086f2 v8::internal::FactoryBase<v8::internal::Factory>::AllocateRawArray(int, v8::internal::AllocationType) [node]
    20: 0xd087a4 v8::internal::FactoryBase<v8::internal::Factory>::NewFixedArrayWithFiller(v8::internal::Handle<v8::internal::Map>, int, v8::internal::Handle<v8::internal::Oddball>, v8::internal::AllocationType) [node]
    21: 0xe650dd v8::internal::DeoptimizationData::New(v8::internal::Isolate*, int, v8::internal::AllocationType) [node]
    22: 0x19e9094 v8::internal::compiler::CodeGenerator::GenerateDeoptimizationData() [node]
    23: 0x19e9797 v8::internal::compiler::CodeGenerator::FinalizeCode() [node]
    24: 0x1a7b0fb v8::internal::compiler::PipelineImpl::FinalizeCode(bool) [node]
    25: 0x1a7c1c7 v8::internal::compiler::PipelineCompilationJob::FinalizeJobImpl(v8::internal::Isolate*) [node]
    26: 0xc42c70 v8::internal::OptimizedCompilationJob::FinalizeJob(v8::internal::Isolate*) [node]
    27: 0xc4b59b v8::internal::Compiler::FinalizeOptimizedCompilationJob(v8::internal::OptimizedCompilationJob*, v8::internal::Isolate*) [node]
    28: 0xc6d18d v8::internal::OptimizingCompileDispatcher::InstallOptimizedFunctions() [node]
    29: 0xcebc1f v8::internal::StackGuard::HandleInterrupts() [node]
    30: 0x105ae7a v8::internal::Runtime_StackGuardWithGap(int, unsigned long*, v8::internal::Isolate*) [node]
    31: 0x14011f9  [node]
    Aborted (core dumped)
    ```

    修复方法：每次翻译到一个目标语言，目标太多的话就写个 `sh` ...

## 参考
* [百度翻译文档](https://fanyi-api.baidu.com/doc/21)
* [基于百度翻译API的node插件](https://blog.csdn.net/qq_42036203/article/details/113062307)
* [esutton/i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts)


ps: 作者 js 小白一个，代码写的渣渣无比，仅仅能用，多多包涵，欢迎改进。

