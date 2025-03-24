type COSActionType = 'cos:InitiateMultipartUpload' | 'cos:ListMultipartUploads' | 'cos:ListParts' | 'cos:UploadPart' | 'cos:CompleteMultipartUpload' | 'cos:GetObject' | 'cos:GetBucket' | 'cos:DeleteObject' | 'cos:HeadObject' | 'cos:HeadObject' | 'cos:PostObjectRestore' | 'cos:OptionsObject'

type COSConfigType = {
    secretId: string
    secretKey: string
    proxy: string,
    durationSeconds: number,
    host: string,
    endpoint: string,
    // 放行判断相关参数
    bucket: string,
    region: string,
    // 这里改成允许的路径前缀，可以根据自己网站的用户登录态判断允许上传的具体路径，例子： a.jpg 或者 a/* 或者 * (使用通配符*存在重大安全风险, 请谨慎评估使用)
    allowPrefix: string,
    // 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
    allowActions: COSActionType[],
};

type COSDocumentItem = {
    Key: string,
    LastModified: string,
    ETag: string,
    Size: string,
    Owner: {
        ID: string,
        DisplayName: string
    },
    StorageClass: string
}

type FileItem = {
    isDir: boolean,
    key: string,
    prefix: string,
    size: string,
    lastModified?: string,
}